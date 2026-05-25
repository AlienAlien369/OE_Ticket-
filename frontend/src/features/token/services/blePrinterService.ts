// ============================================================
// BLE PRINTER SERVICE — module-level singleton
// Keeps the BluetoothRemoteGATTCharacteristic alive across
// React route changes so the connection doesn't reset.
// ============================================================

import type { TokenPrintTicketProps } from '../components/TokenPrintTicket'

// ── BLE printer profiles ─────────────────────────────────────
export const BLE_PROFILES = [
  // Xprinter / common generic label printers
  {
    serviceUUID: 'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    charUUID: 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  },
  // Nordic UART (used by many Chinese BLE thermal printers incl. TP-P series)
  {
    serviceUUID: '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    charUUID: '49535343-8841-43f4-a8d4-ecbe34729bb3',
  },
  // iDPRT / older generic
  {
    serviceUUID: '000018f0-0000-1000-8000-00805f9b34fb',
    charUUID: '00002af1-0000-1000-8000-00805f9b34fb',
  },
]

export const ALL_SERVICE_UUIDS = BLE_PROFILES.map((p) => p.serviceUUID)

// ── Singleton state ───────────────────────────────────────────
let _char: BluetoothRemoteGATTCharacteristic | null = null
let _deviceName = ''
let _disconnectListeners: Array<() => void> = []

export function isBleConnected(): boolean {
  return _char !== null
}

export function getBleDeviceName(): string {
  return _deviceName
}

export function getBleChar(): BluetoothRemoteGATTCharacteristic | null {
  return _char
}

export function setBleConnection(
  char: BluetoothRemoteGATTCharacteristic | null,
  name: string,
): void {
  _char = char
  _deviceName = name
}

/** Register a callback fired when the printer disconnects. Returns an unsubscribe fn. */
export function onBleDisconnect(cb: () => void): () => void {
  _disconnectListeners.push(cb)
  return () => {
    _disconnectListeners = _disconnectListeners.filter((l) => l !== cb)
  }
}

export function fireBleDisconnect(): void {
  _char = null
  _deviceName = ''
  _disconnectListeners.forEach((l) => l())
}

// ── Chunk writer ──────────────────────────────────────────────
export async function writeInChunks(
  char: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array,
  chunkSize = 200,
): Promise<void> {
  for (let i = 0; i < data.length; i += chunkSize) {
    await char.writeValueWithoutResponse(data.slice(i, i + chunkSize))
    await new Promise((r) => setTimeout(r, 20))
  }
}

// ── ESC/POS builder ───────────────────────────────────────────
export function buildEscPos(data: Required<TokenPrintTicketProps>): Uint8Array {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []

  const cmd = (...bytes: number[]) => parts.push(new Uint8Array(bytes))
  const txt = (s: string) => parts.push(enc.encode(s))
  const lf = () => cmd(0x0a)
  const divider = () => txt('--------------------------------\n')

  cmd(0x1b, 0x40) // ESC @ – initialise
  cmd(0x1b, 0x61, 0x01) // center
  cmd(0x1b, 0x21, 0x10) // double height
  txt('MEDICAL ASSISTANCE\n')
  cmd(0x1b, 0x21, 0x00) // normal
  txt('HOSPITAL TOKEN SLIP\n')
  divider()

  cmd(0x1b, 0x61, 0x00) // left
  txt(`Name   : ${data.name}\n`)
  txt(`Gender : ${data.gender}   Age: ${data.age}\n`)
  txt(`Mobile : ${data.mobile}\n`)
  divider()

  if (data.checkedItems.length > 0) {
    txt('CONDITIONS:\n')
    for (const item of data.checkedItems) {
      txt(`[X] ${item}\n`)
    }
    divider()
  }

  txt(`Status    : ${data.status || '-'}\n`)
  divider()

  cmd(0x1b, 0x61, 0x01) // center
  const barcodeBytes = enc.encode(data.barcodeValue)
  cmd(0x1d, 0x6b, 0x49, barcodeBytes.length)
  parts.push(barcodeBytes)
  lf()
  txt(`${data.barcodeValue}\n`)
  divider()

  cmd(0x1b, 0x61, 0x00) // left
  txt(`TOKEN    : ${data.token}\n`)
  txt(`Table No : ${data.tableNo}\n`)
  lf(); lf(); lf()
  cmd(0x1d, 0x56, 0x00) // full cut

  const total = parts.reduce((n, p) => n + p.length, 0)
  const result = new Uint8Array(total)
  let off = 0
  for (const p of parts) {
    result.set(p, off)
    off += p.length
  }
  return result
}

// ── High-level print helper ───────────────────────────────────
export async function printTicket(data: Required<TokenPrintTicketProps>): Promise<void> {
  const char = getBleChar()
  if (!char) throw new Error('Printer not connected')
  const bytes = buildEscPos(data)
  await writeInChunks(char, bytes)
}
