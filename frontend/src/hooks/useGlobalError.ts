import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

/** Catches unhandled promise rejections and JS errors globally */
export const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason)
      if (import.meta.env.DEV) {
        toast.error(`Unhandled error: ${event.reason?.message ?? 'Unknown error'}`)
      }
      event.preventDefault()
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      if (import.meta.env.DEV) {
        toast.error(`Error: ${event.message}`)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])
}
