import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusCircle, ChevronRight, Info, Printer, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@components/ui/Button'
import { ROUTES } from '@config/index'
import { TokenPrintTicket } from './TokenPrintTicket'
import type { TokenPrintTicketProps } from './TokenPrintTicket'
import { useCreateNewToken } from '../hooks/useTokenApplication'
import type { NewTokenResponseDto } from '../services/tokenService'

const CURRENT_YEAR = new Date().getFullYear()
const MIN_YEAR = 1900

const profileSchema = z.object({
  mobileNumber:  z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
  firstName:     z.string().min(2, 'First name is required'),
  middleName:    z.string().optional(),
  lastName:      z.string().min(2, 'Last name is required'),
  gender: z
    .string()
    .min(1, 'Gender is required')
    .refine((v) => ['Male', 'Female', 'Other'].includes(v), 'Select a valid gender'),
  birthYear: z.coerce
    .number({ invalid_type_error: 'Enter a valid year' })
    .int()
    .min(MIN_YEAR, `Year must be after ${MIN_YEAR}`)
    .max(CURRENT_YEAR, 'Year cannot be in the future'),
})

type ProfileFormData = z.infer<typeof profileSchema>

const calcAge = (year: number) =>
  year >= MIN_YEAR && year <= CURRENT_YEAR ? CURRENT_YEAR - year : 0

const Err = ({ msg }: { msg?: string | undefined }) =>
  msg ? <p className="text-xs text-destructive mt-1">{msg}</p> : null

export const CreateProfilePage = () => {
  const navigate = useNavigate()
  const { mutateAsync: createToken, isPending } = useCreateNewToken()
  const [result, setResult] = useState<NewTokenResponseDto | null>(null)
  const [printData, setPrintData] = useState<Required<TokenPrintTicketProps> | null>(null)

  const doPrint = (d: Required<TokenPrintTicketProps>) => {
    setPrintData(d); setTimeout(() => window.print(), 100)
  }

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: { mobileNumber: '', aadhaarNumber: '', firstName: '', middleName: '', lastName: '', gender: '' },
  })

  const byear = watch('birthYear')

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const age = calcAge(data.birthYear)
      const dob = `${data.birthYear}-01-01`
      const resp = await createToken({
        firstName: data.firstName,
        middleName: data.middleName || undefined,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: dob,
        age,
        mobileNumber: data.mobileNumber,
        aadhaarNumber: data.aadhaarNumber || undefined,
      })
      const td = resp.data!
      setResult(td)
      localStorage.setItem('token-profile', JSON.stringify({
        firstName: data.firstName, middleName: data.middleName, lastName: data.lastName,
        gender: data.gender, dob, age, mobileNumber: data.mobileNumber,
        aadhaarNumber: data.aadhaarNumber, token: td.tokenNumber, applicationId: td.applicationId,
      }))
      toast.success(`Token: ${td.tokenNumber}`)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to create token.')
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">New Token</h2>
          <p className="mt-1 text-sm text-muted-foreground">Register patient details and generate a token</p>
        </div>

        {result && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Token Generated Successfully</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Token Number</p>
                <p className="text-2xl font-bold tracking-tight">{result.tokenNumber}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {result.fullName} &middot; Application #{result.applicationId}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" type="button"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => doPrint({
                    name: result.fullName,
                    gender: result.gender === 'M' ? 'Male' : result.gender === 'F' ? 'Female' : 'Other',
                    age: result.age, mobile: result.mobileNumber, token: result.tokenNumber,
                    tableNo: '', checkedItems: [], status: '' as '', barcodeValue: result.tokenNumber.replace(/\W/g, '').slice(0, 8).toUpperCase(),
                  })}>
                  Print Token
                </Button>
                <Button size="sm" type="button" rightIcon={<ChevronRight className="h-4 w-4" />}
                  onClick={() => navigate(ROUTES.PHOTO_CAPTURE, { state: { profile: JSON.parse(localStorage.getItem('token-profile') ?? 'null') } })}>
                  Continue to Photo
                </Button>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])(e) }}
          className="rounded-xl border border-border bg-card p-5" noValidate>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Patient Details
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mobile Number *</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                maxLength={10} inputMode="numeric" placeholder="10-digit mobile" {...register('mobileNumber')} />
              <Err msg={errors.mobileNumber?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">UID / Aadhaar *</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                maxLength={12} inputMode="numeric" placeholder="12-digit Aadhaar" {...register('aadhaarNumber')} />
              <Err msg={errors.aadhaarNumber?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">First Name *</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register('firstName')} />
              <Err msg={errors.firstName?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Middle Name</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register('middleName')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Last Name *</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register('lastName')} />
              <Err msg={errors.lastName?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Gender *</label>
              <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register('gender')}>
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <Err msg={errors.gender?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Birth Year *</label>
              <input type="number" min={MIN_YEAR} max={CURRENT_YEAR} placeholder="e.g. 1985"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register('birthYear')} />
              <Err msg={errors.birthYear?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Age (auto)</label>
              <input readOnly value={byear ? `${calcAge(Number(byear))} yrs` : '—'}
                className="w-full rounded-lg border border-input bg-muted/20 px-3 py-2 text-sm cursor-default" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" type="button" disabled={isPending}
              onClick={() => { reset(); setResult(null) }}>Clear</Button>
            <Button type="submit" disabled={!isValid || isPending}
              rightIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}>
              {isPending ? 'Creating...' : result ? 'Re-generate' : 'Generate Token'}
            </Button>
          </div>
        </form>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{result ? result.tokenNumber : 'No token yet'}</span>
            </div>
            <Button size="sm" variant="ghost" type="button" leftIcon={<Printer className="h-4 w-4" />}
              onClick={() => doPrint({ name: 'Sample Patient', gender: 'Male', age: 45, mobile: '9999999999',
                token: 'TC.01 01 2025 000001', tableNo: '', checkedItems: [], status: '' as '', barcodeValue: 'OE000001' })}>
              Sample Print
            </Button>
          </div>
        </section>
      </div>

      {printData && <div className="hidden print:block"><TokenPrintTicket {...printData} /></div>}
    </div>
  )
}
