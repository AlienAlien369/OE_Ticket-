// ============================================================
// PRINT PAGE — search application and print token ticket
// ============================================================

import { memo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Printer, Search, Loader2, AlertCircle, X, ChevronRight } from 'lucide-react'
import { usePrintTicket, useApplicationList } from '../hooks/use-print'
import type { PrintTicketData } from '../services/print.service'
import { cn } from '@utils/cn'

// ── Ticket layout (matches original DB schema printout) ──────────────────
const TicketPreview = memo(({ data }: { data: PrintTicketData }) => {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const el = printRef.current
    if (!el) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OE Token — ${data.applicationId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; }
            .ticket { border: 2px solid #000; padding: 12px; max-width: 460px; }
            .header { text-align: center; border-bottom: 1px solid #000; pb: 8px; margin-bottom: 8px; }
            .header h2 { font-size: 16px; font-weight: bold; }
            .row { display: flex; margin-bottom: 4px; }
            .label { font-weight: bold; width: 160px; flex-shrink: 0; }
            .value { flex: 1; }
            .section { margin-top: 8px; border-top: 1px dashed #999; padding-top: 6px; }
            .badge { border: 1px solid #000; display: inline-block; padding: 1px 6px; margin-right: 4px; font-size: 10px; }
          </style>
        </head>
        <body>${el.innerHTML}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  return (
    <div className="space-y-4">
      <div ref={printRef} className="rounded-xl border-2 border-border bg-card p-5 shadow-sm text-sm max-w-lg">
        {/* Ticket header */}
        <div className="text-center border-b border-border pb-3 mb-4">
          <h2 className="text-lg font-bold tracking-tight">OE TICKET</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Token / Application Receipt</p>
        </div>

        <div className="space-y-2">
          <Row label="Application ID" value={String(data.applicationId)} bold />
          <Row label="Date" value={new Date(data.applicationDate).toLocaleDateString('en-IN')} />
          <Row label="Batch Code" value={data.batchCode} />
          <Row label="Serial #" value={String(data.serialNumber)} />
          <Row label="Centre ID" value={data.applicationCentreId} />
        </div>

        <div className="my-3 border-t border-dashed border-border" />

        <div className="space-y-2">
          <Row label="Applicant Name" value={data.applicantName} bold />
          <Row label="Gender" value={data.gender} />
          <Row label="Age" value={`${data.age} yrs`} />
          {data.dateOfBirth && <Row label="Date of Birth" value={new Date(data.dateOfBirth).toLocaleDateString('en-IN')} />}
          <Row label="Blood Group" value={data.bloodGroup} />
          <Row label="Mobile" value={data.mobileNumber} />
          <Row label="Address" value={data.address} />
          <Row label="Satsang Centre" value={data.weeklySatsangCentre} />
        </div>

        {/* Medical */}
        <div className="my-3 border-t border-dashed border-border" />
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Medical Info</p>
          <div className="flex flex-wrap gap-1.5">
            {data.medicalInfo.isDiabetes && <MedBadge label="Diabetes" />}
            {data.medicalInfo.isHypertension && <MedBadge label="Hypertension" />}
            {data.medicalInfo.isCAD && <MedBadge label="CAD" />}
          </div>
          {data.medicalInfo.medicalProblem && <Row label="Conditions" value={data.medicalInfo.medicalProblem} />}
          {data.medicalInfo.drugAllergies && <Row label="Drug Allergies" value={data.medicalInfo.drugAllergies} />}
        </div>

        {data.isAttendantAllowed && data.attendantName && (
          <>
            <div className="my-3 border-t border-dashed border-border" />
            <Row label="Attendant" value={data.attendantName} />
          </>
        )}

        <div className="my-3 border-t border-border" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Status</p>
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            data.applicationStatus === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : data.applicationStatus === 'P' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-muted text-muted-foreground'
          )}>
            {data.applicationStatus === 'A' ? 'Approved'
              : data.applicationStatus === 'P' ? 'Pending'
              : data.applicationStatus}
          </span>
        </div>
      </div>

      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
      >
        <Printer className="h-4 w-4" />
        Print Ticket
      </button>
    </div>
  )
})
TicketPreview.displayName = 'TicketPreview'

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className="flex gap-2 text-sm">
    <span className="w-36 shrink-0 text-muted-foreground text-xs font-medium">{label}</span>
    <span className={cn('flex-1 break-words', bold && 'font-semibold text-foreground')}>{value}</span>
  </div>
)

const MedBadge = ({ label }: { label: string }) => (
  <span className="text-xs border border-destructive/40 bg-destructive/5 text-destructive px-2 py-0.5 rounded">
    {label}
  </span>
)

// ── Application list row ──────────────────────────────────────────────────
const AppListRow = ({
  item,
  onSelect,
}: {
  item: { id: string | number; applicantName: string; applicationDate: string; status: string; batchCode: string }
  onSelect: (id: string) => void
}) => (
  <button
    onClick={() => onSelect(String(item.id))}
    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left"
  >
    <div>
      <p className="text-sm font-medium text-foreground">{item.applicantName}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        ID: {item.id} · {new Date(item.applicationDate).toLocaleDateString('en-IN')} · {item.batchCode}
      </p>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
  </button>
)

// ── Main page ──────────────────────────────────────────────────────────────
export const PrintPage = () => {
  const [searchInput, setSearchInput] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const {
    data: list,
    isLoading: listLoading,
  } = useApplicationList()

  const {
    data: ticketData,
    isLoading: ticketLoading,
    isError: ticketError,
    error,
  } = usePrintTicket(activeId)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) setActiveId(trimmed)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Printer className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Print Ticket</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Search an application by ID and print its token ticket.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: search + list */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Application ID..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-background border border-input text-sm
                  focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setActiveId(null) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Search
            </button>
          </form>

          {/* Recent applications */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Applications</p>
            </div>
            {listLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : list?.items?.length ? (
              <div className="divide-y divide-border">
                {list.items.map((item) => (
                  <AppListRow key={item.id} item={item} onSelect={setActiveId} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No applications found.</p>
            )}
          </div>
        </div>

        {/* Right: ticket preview */}
        <div>
          <AnimatePresence mode="wait">
            {ticketLoading && (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </motion.div>
            )}

            {ticketError && !ticketLoading && (
              <motion.div key="error"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 gap-2 text-destructive">
                <AlertCircle className="h-7 w-7" />
                <p className="text-sm">{(error as Error)?.message ?? 'Application not found.'}</p>
              </motion.div>
            )}

            {ticketData && !ticketLoading && !ticketError && (
              <motion.div key="ticket"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                <TicketPreview data={ticketData} />
              </motion.div>
            )}

            {!activeId && !ticketLoading && (
              <motion.div key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <Printer className="h-10 w-10 opacity-30" />
                <p className="text-sm">Select or search an application to preview its ticket</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
