import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusCircle, ChevronRight, Info, Printer } from 'lucide-react'
import { Button } from '@components/ui/Button'
import { ROUTES } from '@config/index'
import { TokenPrintTicket } from './TokenPrintTicket'
import type { TokenPrintTicketProps } from './TokenPrintTicket'




const profileSchema = z
  .object({
    mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
    aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
    firstName: z.string().min(2, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(2, 'Last name is required'),
    gender: z
      .string()
      .min(1, 'Gender is required')
      .refine((value) => ['Male', 'Female', 'Other'].includes(value), 'Gender is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    age: z.coerce.number().int().min(0).max(120),
  })
  .superRefine((values, ctx) => {
    const dobDate = new Date(values.dob)
    if (Number.isNaN(dobDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dob'],
        message: 'Please select a valid date',
      })
    }
  })

type ProfileFormData = z.infer<typeof profileSchema>


const calculateAge = (dob: string) => {
  const birthDate = new Date(dob)
  if (Number.isNaN(birthDate.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return age < 0 ? 0 : age
}

const ErrorText = ({ message }: { message: string | undefined }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null

export const CreateProfilePage = () => {
  const navigate = useNavigate()
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [printData, setPrintData] = useState<Required<TokenPrintTicketProps> | null>(null)

  const triggerPrint = (data: Required<TokenPrintTicketProps>) => {
    setPrintData(data)
    // Let React render the ticket into the DOM first, then open system print dialog
    setTimeout(() => window.print(), 100)
  }

  const handlePrint = () => {
    const profile = JSON.parse(localStorage.getItem('token-profile') ?? 'null')
    if (!profile) {
      toast.error('No patient profile found. Save a profile first.')
      return
    }
    const barcodeValue = String(profile.token ?? '')
      .replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase() || 'GC1355'
    triggerPrint({
      name: `${profile.firstName} ${profile.lastName}`,
      gender: profile.gender ?? '',
      age: profile.age ?? '',
      mobile: profile.mobileNumber ?? '',
      token: profile.token ?? '',
      tableNo: '',
      checkedItems: [],
      status: '' as '',
      barcodeValue,
    })
  }

  const handleSamplePrint = () => {
    triggerPrint({
      name: 'Sample Patient',
      gender: 'Male',
      age: 45,
      mobile: '9999999999',
      token: 'TC.01 01 2025 123456',
      tableNo: '3A',
      checkedItems: ['ADVOAHP', 'POLIO'],
      status: '' as '',
      barcodeValue: 'GC1355',
    })
  }
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      mobileNumber: '',
      aadhaarNumber: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      dob: '',
      age: 0,
    },
  })

  const dob = watch('dob')

  const handleDobChange = (value: string) => {
    setValue('dob', value, { shouldValidate: true, shouldDirty: true })
    setValue('age', calculateAge(value), { shouldValidate: true, shouldDirty: true })
  }

  const onSubmit = (data: ProfileFormData) => {
    const newToken = `TC.${new Date().toLocaleDateString('en-GB').replaceAll('/', ' ')} ${Math.floor(
      100000 + Math.random() * 900000
    )}`

    setGeneratedToken(newToken)
    localStorage.setItem(
      'token-profile',
      JSON.stringify({
        ...data,
        token: newToken,
      })
    )
    toast.success('Profile saved and token generated')
    navigate(ROUTES.PHOTO_CAPTURE, { state: { profile: { ...data, token: newToken } } })
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            System registration for ChatMed 2.0 token generation
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-border bg-card p-5"
          noValidate
        >
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Details
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mobile Number</label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                maxLength={10}
                inputMode="numeric"
                {...register('mobileNumber')}
              />
              <ErrorText message={errors.mobileNumber?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">UID Aadhaar Number</label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                maxLength={12}
                inputMode="numeric"
                {...register('aadhaarNumber')}
              />
              <ErrorText message={errors.aadhaarNumber?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">First Name</label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register('firstName')}
              />
              <ErrorText message={errors.firstName?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Middle Name</label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register('middleName')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register('lastName')}
              />
              <ErrorText message={errors.lastName?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Gender</label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register('gender')}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <ErrorText message={errors.gender?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(event) => handleDobChange(event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <ErrorText message={errors.dob?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Age</label>
              <input
                readOnly
                className="w-full rounded-lg border border-input bg-muted/20 px-3 py-2 text-sm"
                value={calculateAge(dob)}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() =>
                reset({
                  mobileNumber: '',
                  aadhaarNumber: '',
                  firstName: '',
                  middleName: '',
                  lastName: '',
                  gender: '',
                  dob: '',
                  age: 0,
                })
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Save & Continue
            </Button>
          </div>
        </form>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Token generated</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Printer className="h-4 w-4" />}
                type="button"
                onClick={handleSamplePrint}
              >
                Sample Print
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Printer className="h-4 w-4" />}
                type="button"
                onClick={handlePrint}
              >
                Print
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
            {generatedToken ?? 'No token generated yet'}
          </p>
        </section>
      </div>

      {/* Hidden ticket — only visible in system print dialog */}
      {printData && (
        <div className="hidden print:block">
          <TokenPrintTicket {...printData} />
        </div>
      )}
    </div>
  )
}
