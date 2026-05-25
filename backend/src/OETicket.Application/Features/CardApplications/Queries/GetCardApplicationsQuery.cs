using MediatR;
using Microsoft.EntityFrameworkCore;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;
using OETicket.Application.Features.CardApplications.DTOs;

namespace OETicket.Application.Features.CardApplications.Queries;

// ── Query ──────────────────────────────────────────────────────────────────
public sealed record GetCardApplicationsQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    char? Status = null)
    : IRequest<ApiResponse<PaginatedResponse<CardApplicationDto>>>;

// ── Handler ────────────────────────────────────────────────────────────────
public sealed class GetCardApplicationsQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetCardApplicationsQuery, ApiResponse<PaginatedResponse<CardApplicationDto>>>
{
    public async Task<ApiResponse<PaginatedResponse<CardApplicationDto>>> Handle(
        GetCardApplicationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = dbContext.CardApplications.AsNoTracking();

        if (request.Status.HasValue)
            query = query.Where(a => a.ApplicationStatus == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(a =>
                a.GivenName.ToLower().Contains(term) ||
                (a.FamilyName != null && a.FamilyName.ToLower().Contains(term)) ||
                a.MobileNumber.Contains(term) ||
                (a.Uid != null && a.Uid.Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedOn)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new CardApplicationDto(
                a.Id, a.ApplicationDate, a.ApplicationType,
                a.ApplicationBatchCode, a.Title,
                a.GivenName, a.FamilyName, a.MiddleName,
                a.Gender, a.Age, a.DateOfBirth,
                a.MobileNumber, a.Email, a.BloodGroup,
                a.MedicalProblem, a.IsDiabetes, a.IsHypertension, a.IsCAD,
                a.ApplicationStatus, a.IsCardGenerated,
                a.ApplicationCentreId, a.CreatedBy, a.CreatedOn))
            .ToListAsync(cancellationToken);

        return ApiResponse<PaginatedResponse<CardApplicationDto>>.Ok(
            new PaginatedResponse<CardApplicationDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            });
    }
}
