import { useQuery } from '@tanstack/react-query'
import { printService } from '../services/print.service'

export const usePrintTicket = (applicationId: string | number | null) => {
  return useQuery({
    queryKey: ['print', 'ticket', applicationId],
    queryFn: () => printService.getTicket(applicationId!),
    enabled: applicationId !== null && applicationId !== '',
    retry: 1,
  })
}

export const useApplicationList = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['print', 'list', page, pageSize],
    queryFn: () => printService.listApplications(page, pageSize),
    staleTime: 30 * 1000,
  })
}
