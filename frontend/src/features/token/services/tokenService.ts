// ============================================================
// TOKEN SERVICE — API calls for New Token / Card Application
// ============================================================

import { api } from '@features/auth/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/index'

// ── DTOs (must mirror backend DTOs) ─────────────────────────────────────────

export interface NewTokenRequestDto {
  firstName: string
  middleName?: string | undefined
  lastName: string
  gender: string
  dateOfBirth: string
  age: number
  mobileNumber: string
  aadhaarNumber?: string | undefined
}

export interface NewTokenResponseDto {
  applicationId: number
  tokenNumber: string
  fullName: string
  gender: string
  age: number
  mobileNumber: string
  applicationDate: string
}

export interface CardApplicationDto {
  id: number
  applicationDate: string
  applicationType: string
  applicationBatchCode: string
  givenName: string
  familyName?: string
  middleName?: string
  gender: string
  age: number
  dateOfBirth?: string
  mobileNumber: string
  email?: string
  bloodGroup: string
  applicationStatus: string
  isCardGenerated: boolean
  applicationCentreId: string
  createdBy: string
  createdOn: string
}

// ── API calls ────────────────────────────────────────────────────────────────

export const tokenService = {
  /**
   * POST /api/v1/card-applications/new-token
   * Creates a new token application from the profile form.
   */
  createNewToken: (data: NewTokenRequestDto) =>
    api.post<ApiResponse<NewTokenResponseDto>>(
      '/card-applications/new-token',
      data
    ),

  /**
   * PUT /api/v1/card-applications/{id}/photo
   * Saves the base64-encoded profile photo to the database.
   */
  savePhoto: (applicationId: number, photoBase64: string) =>
    api.put<ApiResponse<boolean>>(
      `/card-applications/${applicationId}/photo`,
      { photoBase64 }
    ),

  /**
   * GET /api/v1/card-applications
   * Returns a paginated list of card applications.
   */
  getCardApplications: (params?: {
    pageNumber?: number
    pageSize?: number
    search?: string
    status?: string
  }) =>
    api.get<ApiResponse<PaginatedResponse<CardApplicationDto>>>(
      '/card-applications',
      { params }
    ),
}
