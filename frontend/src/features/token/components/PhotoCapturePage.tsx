import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Camera, Upload, CircleCheck, Circle, ChevronRight, Loader2, Cloud } from 'lucide-react'
import { Button } from '@components/ui/Button'
import { ROUTES } from '@config/index'
import { tokenService } from '../services/tokenService'

const STEPS = ['Personal Details', 'Document Upload', 'Capture Photo']

type StoredProfile = {
  mobileNumber: string
  aadhaarNumber: string
  firstName: string
  middleName?: string
  lastName: string
  gender: string
  dob: string
  age: number
  token: string
  applicationId?: number
}

const formatDisplayDate = (dob: string) => {
  if (!dob) return '-'
  const date = new Date(dob)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB')
}

const maskAadhaar = (aadhaar: string) =>
  aadhaar ? `${aadhaar.slice(0, 4)} ${aadhaar.slice(4, 8)} ${aadhaar.slice(8, 12)}` : '-'

export const PhotoCapturePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string>('')
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const profile = useMemo(() => {
    const fromState = (location.state as { profile?: StoredProfile } | null)?.profile
    if (fromState) return fromState
    const rawProfile = localStorage.getItem('token-profile')
    if (!rawProfile) return null
    try {
      return JSON.parse(rawProfile) as StoredProfile
    } catch {
      return null
    }
  }, [location.state])

  useEffect(
    () => () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    },
    [cameraStream]
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video || !cameraStream) return

    video.srcObject = cameraStream
    video
      .play()
      .then(() => setIsVideoReady(true))
      .catch(() => {
        setIsVideoReady(false)
        toast.error('Unable to start video preview')
      })
  }, [cameraStream])

  const startWebcam = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      setCapturedPhoto('')
      setIsVideoReady(false)
      setCameraStream(stream)
      toast.success('Webcam started')
    } catch {
      toast.error('Unable to access webcam')
    }
  }

  const captureFromWebcam = () => {
    const video = videoRef.current
    if (!video || !isVideoReady || video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Webcam is not ready yet. Please wait a moment.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 360
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageUrl = canvas.toDataURL('image/png')
    setCapturedPhoto(imageUrl)
    toast.success('Photo captured')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedPhoto(reader.result)
        toast.success('Photo uploaded')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSavePhoto = async () => {
    if (!capturedPhoto) {
      toast.error('Please capture or upload a photo first')
      return
    }

    // Always save to localStorage as a quick local cache
    localStorage.setItem('token-photo', capturedPhoto)

    // If we have an applicationId, persist to the backend too
    const applicationId: number | undefined = profile?.applicationId as number | undefined
    if (applicationId) {
      setIsSaving(true)
      try {
        await tokenService.savePhoto(applicationId, capturedPhoto)
        toast.success('Photo saved to server ✓')
      } catch {
        // Non-fatal — photo is still in localStorage
        toast.success('Photo saved locally (offline mode)')
      } finally {
        setIsSaving(false)
      }
    } else {
      toast.success('Photo saved locally')
    }

    navigate(ROUTES.TOKEN_PRINT, { state: { profile } })
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Photo Capture & Verification</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture biometric photo and verify patient identity
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            STEP 02 OF 03
          </span>
        </div>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Aadhaar Number</p>
              <p className="text-base font-semibold text-foreground">
                {maskAadhaar(profile?.aadhaarNumber ?? '')}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Verify Token</p>
              <p className="text-base font-semibold text-foreground">{profile?.token ?? '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Patient Profile</h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'No profile data found'}
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-muted-foreground">
                  <span>Age (Aadhaar):</span>
                  <span className="text-foreground">{profile?.age ?? '-'} Years</span>
                  <span>DOB:</span>
                  <span className="text-foreground">{formatDisplayDate(profile?.dob ?? '')}</span>
                  <span>Gender:</span>
                  <span className="text-foreground">{profile?.gender ?? '-'}</span>
                  <span>Mobile Number:</span>
                  <span className="text-foreground">{profile?.mobileNumber ?? '-'}</span>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                Information verified successfully.
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Biometric Photo</h3>
              <div className="flex h-64 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/30">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured profile" className="h-full w-full object-cover" />
                ) : cameraStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onLoadedMetadata={() => setIsVideoReady(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Start webcam or upload a photo</p>
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button variant="outline" type="button" leftIcon={<Camera className="h-4 w-4" />} onClick={startWebcam}>
                  Start Webcam
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  leftIcon={<Camera className="h-4 w-4" />}
                  onClick={captureFromWebcam}
                  disabled={!cameraStream || !isVideoReady}
                >
                  Capture
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  leftIcon={<Upload className="h-4 w-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Photo Guidelines &amp; Storage
                  </p>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>- Ensure face is clearly visible and centered</li>
                  <li>- Capture with neutral expression and good lighting</li>
                  <li>- Avoid glasses or headwear if possible</li>
                  <li className="text-primary/70">- Photo is saved to the server with the application record</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => navigate(ROUTES.CREATE_PROFILE)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={handleSavePhoto}
              rightIcon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Photo & Continue'}
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {STEPS.map((step, index) => {
              const isComplete = index < 2
              const isActive = index === 2
              return (
                <div key={step} className="flex items-center gap-2">
                  {isComplete ? (
                    <CircleCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
