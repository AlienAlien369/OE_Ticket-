import { api } from '@features/auth/services/api-client'

export interface PrintTicketData {
  applicationId: number
  tokenNumber: string
  applicantName: string
  applicationDate: string
  gender: string
  age: number
  dateOfBirth: string | null
  bloodGroup: string
  mobileNumber: string
  address: string
  weeklySatsangCentre: string
  serialNumber: number
  applicationCentreId: string
  batchCode: string
  medicalInfo: {
    isDiabetes: boolean
    isHypertension: boolean
    isCAD: boolean
    medicalProblem: string | null
    drugAllergies: string | null
  }
  isAttendantAllowed: boolean
  attendantName: string | null
  applicationStatus: string
}

interface BackendPrintResponse {
  success: boolean
  data: PrintTicketData
  message?: string
}

// Raw shape returned by GET /card-applications
interface CardApplicationItem {
  id: number
  givenName: string
  familyName?: string
  applicationDate: string
  applicationStatus: string
  applicationBatchCode: string
}

interface BackendListResponse {
  success: boolean
  data: {
    items: CardApplicationItem[]
    totalCount: number
  }
}

export const printService = {
  getTicket: async (applicationId: string | number): Promise<PrintTicketData> => {
    const response = await api.get<BackendPrintResponse>(`/print/${applicationId}`)
    if (!response.success) throw new Error(response.message ?? 'Application not found')
    return response.data
  },

  listApplications: async (page = 1, pageSize = 20) => {
    const response = await api.get<BackendListResponse>(
      `/card-applications?pageNumber=${page}&pageSize=${pageSize}`
    )
    if (!response.success) throw new Error('Failed to load applications')

    // Map backend fields to the shape AppListRow expects
    const items = response.data.items.map((item) => ({
      id: item.id,
      applicantName: [item.givenName, item.familyName].filter(Boolean).join(' '),
      applicationDate: item.applicationDate,
      status: item.applicationStatus,
      batchCode: (item.applicationBatchCode ?? '').trim(),
    }))

    return { items, totalCount: response.data.totalCount }
  },
}
