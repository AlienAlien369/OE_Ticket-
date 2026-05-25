// ============================================================
// TOKEN PRINT TICKET — printable medical assistance form
// Optimised for 80 mm thermal paper (Epson M328A / TP-P20)
// ============================================================

import React from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
export interface TokenPrintTicketProps {
  name?: string
  gender?: string
  age?: number | string
  mobile?: string
  token?: string
  tableNo?: string
  checkedItems?: string[]
  status?: 'A' | 'R' | 'H' | 'A+1' | ''
  barcodeValue?: string
}

// ── Checklist data ─────────────────────────────────────────────────────────
export const CHECKLIST_ITEMS = [
  'ADVOAHP',
  'ADVOASP',
  'CA ON RADI/Surgery/Stage III CA',
  'COLOSTOMY BAG',
  'KNDEF',
  'LLAMPUT',
  'MORB OB',
  'OAKN',
  'PARK DIS',
  'PIVID',
  'PLEGIA',
  'POLIO',
  'POOR GC',
  'RADEF',
  'SP_IMPLAN',
  'THR',
  'TKR',
  'OLD AGE',
] as const

// ── Barcode SVG (Code-39 style visual) ────────────────────────────────────
function generateBars(
  value: string,
): { bars: Array<{ x: number; w: number }>; totalWidth: number } {
  const bars: Array<{ x: number; w: number }> = []
  let x = 8

  const addBar = (w: number) => {
    bars.push({ x, w })
    x += w
  }
  const addGap = (w: number) => {
    x += w
  }

  // start guard
  addBar(2); addGap(1); addBar(1); addGap(1); addBar(2); addGap(3)

  for (const char of value) {
    const code = char.charCodeAt(0)
    for (let bit = 7; bit >= 0; bit--) {
      if ((code >> bit) & 1) {
        addBar(3); addGap(1)
      } else {
        addBar(1); addGap(2)
      }
    }
  }

  // end guard
  addGap(1); addBar(2); addGap(1); addBar(1); addGap(1); addBar(3)

  return { bars, totalWidth: x + 8 }
}

function BarcodeSVG({ value }: { value: string }) {
  const { bars, totalWidth } = generateBars(value)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.min(totalWidth, 220)}
      height={52}
      viewBox={`0 0 ${totalWidth} 52`}
      style={{ display: 'block', margin: '0 auto' }}
    >
      {bars.map((bar, i) => (
        <rect key={i} x={bar.x} y={2} width={bar.w} height={46} fill="#111" />
      ))}
    </svg>
  )
}

// ── Small square checkbox ──────────────────────────────────────────────────
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 28,
        height: 28,
        border: '3px solid #333',
        backgroundColor: checked ? '#111' : 'transparent',
        marginRight: 10,
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    />
  )
}

// ── Underline input row ────────────────────────────────────────────────────
function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 18, gap: 10 }}>
      <span style={{ fontSize: 38, fontWeight: 700, whiteSpace: 'nowrap', minWidth: 180 }}>
        {label}
      </span>
      <span
        style={{
          flex: 1,
          borderBottom: '2px solid #444',
          fontSize: 38,
          paddingBottom: 3,
          color: value ? '#111' : 'transparent',
        }}
      >
        {value ?? '_'}
      </span>
    </div>
  )
}

// ── Half-width field (Gender + Age on same line) ───────────────────────────
function HalfFieldRow({
  label,
  value,
  minLabelWidth = 160,
}: {
  label: string
  value?: string
  minLabelWidth?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flex: 1 }}>
      <span style={{ fontSize: 38, fontWeight: 700, whiteSpace: 'nowrap', minWidth: minLabelWidth }}>
        {label}
      </span>
      <span
        style={{
          flex: 1,
          borderBottom: '2px solid #444',
          fontSize: 38,
          paddingBottom: 3,
          color: value ? '#111' : 'transparent',
        }}
      >
        {value ?? '_'}
      </span>
    </div>
  )
}

// ── Main ticket component ──────────────────────────────────────────────────
export const TokenPrintTicket = React.forwardRef<HTMLDivElement, TokenPrintTicketProps>(
  (
    {
      name = '',
      gender = '',
      age = '',
      mobile = '',
      token = '',
      tableNo = '',
      checkedItems = [],
      status = '',
      barcodeValue = 'GC1355',
    },
    ref,
  ) => {
    const checked = new Set(checkedItems)

    return (
      <div
        id="print-section"
        ref={ref}
        style={{
          width: '100%',
          maxWidth: 700,
          backgroundColor: '#f5f5f5',
          color: '#111',
          fontFamily: 'Arial, Helvetica, sans-serif',
          padding: '24px 0px',
          boxSizing: 'border-box',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          borderRadius: 4,
          border: '1px solid #ccc',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            textAlign: 'center',
            borderBottom: '3px solid #222',
            paddingBottom: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 1, marginBottom: 4, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            MEDICAL ASSISTANCE FORM
          </div>
          <div style={{ fontSize: 26, color: '#444', wordBreak: 'break-word' }}>
            HOSPITAL TOKEN SLIP
          </div>
        </div>

        {/* ── Personal details ── */}
        <div style={{ marginBottom: 20 }}>
          <FieldRow label="Name :" value={name} />
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <HalfFieldRow label="Gender :" value={gender} minLabelWidth={160} />
            <HalfFieldRow label="Age :" value={age !== undefined && age !== '' ? String(age) : ''} minLabelWidth={90} />
          </div>
          <FieldRow label="Mobile no :" value={mobile} />
        </div>

        {/* ── Divider ── */}
        <hr style={{ border: 'none', borderTop: '2px dashed #888', marginBottom: 16 }} />

        {/* ── Medical checklist ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 16 }}>
          {CHECKLIST_ITEMS.map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1.3,
                /* long items (>12 chars) span both columns */
                gridColumn: item.length > 14 ? '1 / -1' : 'auto',
              }}
            >
              <Checkbox checked={checked.has(item)} />
              <span style={{ fontSize: 34, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* ── Status row (A / R / H / A+1) ── */}
        <div
          style={{
            display: 'flex',
            gap: 36,
            alignItems: 'center',
            marginBottom: 16,
            paddingTop: 12,
            borderTop: '2px dashed #888',
          }}
        >
          {(['A', 'R', 'H', 'A+1'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Checkbox checked={status === s} />
              <span style={{ fontSize: 40, fontWeight: 700 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* ── Bold separator ── */}
        <div style={{ borderTop: '4px solid #222', marginBottom: 20 }} />

        {/* ── Barcode section ── */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <BarcodeSVG value={barcodeValue} />
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 4, marginTop: 8, fontFamily: 'monospace' }}>
            {barcodeValue}
          </div>
        </div>

        {/* ── Bottom fields ── */}
        <div>
          <FieldRow label="TOKEN :" value={token} />
          <FieldRow label="Table No :" value={tableNo} />
        </div>
      </div>
    )
  },
)

TokenPrintTicket.displayName = 'TokenPrintTicket'
