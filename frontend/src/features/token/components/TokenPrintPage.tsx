// ============================================================
// TOKEN PRINT PAGE
// Bluetooth (BLE) printer connection + ESC/POS send
// Supports: TP-P20, Xprinter, Nordic-UART and generic BLE
// printers. Falls back to browser print dialog automatically.
//
// AUTO-PRINT: If BLE is already connected when this page loads
// (navigated from CreateProfilePage), it prints immediately and
// goes back — no interaction needed.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Bluetooth,
  BluetoothOff,
  Printer,
  ChevronLeft,
  Wifi,
  WifiOff,
  SquareCheck,
  Square,
} from 'lucide-react'
import { Button } from '@components/ui/Button'
import { ROUTES } from '@config/index'
import { TokenPrintTicket, CHECKLIST_ITEMS } from './TokenPrintTicket'
import type { TokenPrintTicketProps } from './TokenPrintTicket'
import {
  isBleConnected,
  getBleDeviceName,
  getBleChar,
  setBleConnection,
  fireBleDisconnect,
  onBleDisconnect,
  printTicket,
  ALL_SERVICE_UUIDS,
  BLE_PROFILES,
} from '../services/blePrinterService'

// ── Stored profile shape ─────────────────────────────────────────────────
interface StoredProfile {
  firstName: string
  lastName: string
  middleName?: string
  gender: string
  age: number
  mobileNumber: string
  token: string
  aadhaarNumber?: string
  dob?: string
}

type BtStatus = 'idle' | 'connecting' | 'connected' | 'error'
type StatusVal = 'A' | 'R' | 'H' | 'A+1' | ''

// ── Page ───────────────────────────────────────────────────────────────────
export const TokenPrintPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const ticketRef = useRef<HTMLDivElement>(null)

  // Did we arrive here via the "direct print" flow (BLE was connected)?
  const autoPrint = (location.state as { autoPrint?: boolean } | null)?.autoPrint ?? false

  // ── Profile ──────────────────────────────────────────────────────────────
  const profile = useMemo<StoredProfile | null>(() => {
    const fromState = (location.state as { profile?: StoredProfile } | null)?.profile
    if (fromState) return fromState
    const raw = localStorage.getItem('token-profile')
    if (!raw) return null
    try { return JSON.parse(raw) as StoredProfile } catch { return null }
  }, [location.state])

  // ── Form state ───────────────────────────────────────────────────────────
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [status, setStatus] = useState<StatusVal>('')
  const [tableNo, setTableNo] = useState('')

  const toggleItem = (item: string) =>
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    )

  // ── Bluetooth state (synced from singleton) ──────────────────────────────
  const [btStatus, setBtStatus] = useState<BtStatus>(isBleConnected() ? 'connected' : 'idle')
  const [btDeviceName, setBtDeviceName] = useState<string>(getBleDeviceName())

  const btSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator

  // Subscribe to disconnect events from the singleton
  useEffect(() => {
    const unsub = onBleDisconnect(() => {
      setBtStatus('idle')
      setBtDeviceName('')
      toast('Printer disconnected', { icon: '🔌' })
    })
    return unsub
  }, [])

  // ── Ticket data ──────────────────────────────────────────────────────────
  const ticketData = useMemo<Required<TokenPrintTicketProps>>(() => ({
    name: profile ? `${profile.firstName} ${profile.lastName}` : '',
    gender: profile?.gender ?? '',
    age: profile?.age ?? '',
    mobile: profile?.mobileNumber ?? '',
    token: profile?.token ?? '',
    tableNo,
    checkedItems,
    status,
    barcodeValue: profile?.token
      ? profile.token.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase() || 'GC1355'
      : 'GC1355',
  }), [profile, tableNo, checkedItems, status])

  // ── Print via BLE (using singleton char) ─────────────────────────────────
  const printViaBluetooth = useCallback(async () => {
    const char = getBleChar()
    if (!char) return
    try {
      await printTicket(ticketData)
      toast.success('Sent to printer ✓')
    } catch {
      toast.error('Print failed — reconnect the printer and try again')
    }
  }, [ticketData])

  // ── Auto-print on mount if navigated with autoPrint flag ─────────────────
  useEffect(() => {
    if (autoPrint && isBleConnected()) {
      printTicket(ticketData)
        .then(() => {
          toast.success('Printed ✓')
          navigate(-1)
        })
        .catch(() => {
          toast.error('Auto-print failed — printer may have disconnected')
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount

  // ── Print via browser dialog ─────────────────────────────────────────────
  const printViaBrowser = useCallback(() => {
    window.print()
  }, [])

  // ── Connect to BLE printer ───────────────────────────────────────────────
  const connectBluetooth = useCallback(async () => {
    if (!btSupported) {
      toast.error('Web Bluetooth is not supported in this browser (use Chrome/Edge over HTTPS)')
      return
    }
    setBtStatus('connecting')
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ALL_SERVICE_UUIDS,
      })

      const server = await device.gatt!.connect()
      const name = device.name ?? 'Printer'

      let foundChar: BluetoothRemoteGATTCharacteristic | null = null
      for (const prof of BLE_PROFILES) {
        try {
          const svc = await server.getPrimaryService(prof.serviceUUID)
          foundChar = await svc.getCharacteristic(prof.charUUID)
          break
        } catch {
          // try next profile
        }
      }

      if (!foundChar) {
        setBtStatus('error')
        toast.error('Connected but print service not found. Try a different printer.')
        return
      }

      // Save to singleton so other pages can use it
      setBleConnection(foundChar, name)
      setBtStatus('connected')
      setBtDeviceName(name)
      toast.success(`Connected to ${name}`)

      device.addEventListener('gattserverdisconnected', () => {
        fireBleDisconnect()
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        setBtStatus('idle')
        return
      }
      setBtStatus('error')
      toast.error('Bluetooth connection failed')
    }
  }, [btSupported])

  const disconnectBluetooth = useCallback(() => {
    fireBleDisconnect()
    setBtStatus('idle')
    setBtDeviceName('')
    toast('Disconnected from printer', { icon: '🔌' })
  }, [])

  // ── If autoPrint mode, show a loading indicator while printing ────────────
  if (autoPrint && isBleConnected()) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <Printer className="h-12 w-12 animate-pulse text-primary" />
        <p className="text-lg font-semibold text-foreground">Sending to printer…</p>
        <p className="text-sm text-muted-foreground">Please wait</p>
      </div>
    )
  }

  // ── Normal UI ─────────────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-6 print:p-0">
      <div className="mx-auto max-w-5xl space-y-6 print:max-w-none">

        {/* ── Header (hidden when printing) ── */}
        <div className="flex items-start justify-between gap-4 print:hidden">
          <div>
            <button
              onClick={() => navigate(ROUTES.PHOTO_CAPTURE)}
              className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
            <h2 className="text-2xl font-bold text-foreground">Print Token</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure checklist, then print via Bluetooth or browser dialog
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:block">

          {/* ══ LEFT — Controls (hidden when printing) ══ */}
          <div className="space-y-5 print:hidden">

            {/* Bluetooth panel */}
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Bluetooth className="h-4 w-4 text-blue-500" />
                Bluetooth Printer
              </div>

              {btStatus === 'connected' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                    <Wifi className="h-4 w-4" />
                    <span>
                      Connected to <strong>{btDeviceName}</strong>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<BluetoothOff className="h-4 w-4" />}
                      onClick={disconnectBluetooth}
                    >
                      Disconnect
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Printer className="h-4 w-4" />}
                      onClick={printViaBluetooth}
                    >
                      Print via Bluetooth
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {btStatus === 'error' && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <WifiOff className="h-4 w-4" />
                      Connection failed — try again
                    </div>
                  )}
                  {!btSupported && (
                    <p className="text-xs text-amber-600">
                      ⚠ Web Bluetooth requires Chrome/Edge on HTTPS
                    </p>
                  )}
                  <Button
                    size="sm"
                    leftIcon={<Bluetooth className="h-4 w-4" />}
                    onClick={connectBluetooth}
                    disabled={btStatus === 'connecting'}
                    variant="outline"
                  >
                    {btStatus === 'connecting' ? 'Searching…' : 'Connect Printer (TP-P20 / BLE)'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Or use{' '}
                    <button
                      className="underline underline-offset-2"
                      onClick={printViaBrowser}
                    >
                      browser print dialog
                    </button>{' '}
                    to select any paired printer (Epson M328A etc.)
                  </p>
                </div>
              )}
            </section>

            {/* Checklist panel */}
            <section className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Medical Conditions
              </p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {CHECKLIST_ITEMS.map((item) => {
                  const on = checkedItems.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(item)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/50"
                    >
                      {on ? (
                        <SquareCheck className="h-4 w-4 flex-shrink-0 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      )}
                      <span className={on ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                        {item}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Status + table */}
            <section className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <div className="flex gap-3">
                  {(['A', 'R', 'H', 'A+1'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus((prev) => (prev === s ? '' : s))}
                      className={`flex h-9 min-w-[36px] px-2 items-center justify-center rounded-lg border text-sm font-bold transition-colors ${
                        status === s
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Table No
                </label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 3A"
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                />
              </div>
            </section>

            {/* Print action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={printViaBrowser}
              >
                Print (Browser Dialog)
              </Button>
              {btStatus === 'connected' && (
                <Button
                  variant="outline"
                  leftIcon={<Bluetooth className="h-4 w-4" />}
                  onClick={printViaBluetooth}
                >
                  Print via Bluetooth
                </Button>
              )}
            </div>
          </div>

          {/* ══ RIGHT — Ticket preview ══ */}
          <div className="flex flex-col items-center print:items-start">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground print:hidden">
              Ticket Preview
            </p>
            <TokenPrintTicket ref={ticketRef} {...ticketData} />
          </div>
        </div>
      </div>
    </div>
  )
}
