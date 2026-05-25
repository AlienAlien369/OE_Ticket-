using MediatR;
using Microsoft.EntityFrameworkCore;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;
using OETicket.Application.Features.Print.DTOs;

namespace OETicket.Application.Features.Print.Queries;

// ── Query ──────────────────────────────────────────────────────────────────
public sealed record GetPrintTicketQuery(long ApplicationId)
    : IRequest<ApiResponse<PrintTicketDto>>;

// ── Handler ────────────────────────────────────────────────────────────────
public sealed class GetPrintTicketQueryHandler(IApplicationDbContext dbContext)
    : IRequestHandler<GetPrintTicketQuery, ApiResponse<PrintTicketDto>>
{
    public async Task<ApiResponse<PrintTicketDto>> Handle(
        GetPrintTicketQuery request,
        CancellationToken cancellationToken)
    {
        var app = await dbContext.CardApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, cancellationToken);

        if (app is null)
            return ApiResponse<PrintTicketDto>.Fail("Application not found.");

        var serial = await dbContext.ApplicationCentreSerials
            .AsNoTracking()
            .Where(s => s.ApplicationId == app.Id)
            .OrderByDescending(s => s.ApplicationSrNo)
            .FirstOrDefaultAsync(cancellationToken);

        var fullName = string.Join(" ",
            new[] { app.Title?.Trim(), app.GivenName.Trim(), app.MiddleName?.Trim(), app.FamilyName?.Trim() }
            .Where(s => !string.IsNullOrWhiteSpace(s)));

        var tokenNumber = $"TC.{app.ApplicationDate:dd MM yyyy} {app.Id:D6}";

        return ApiResponse<PrintTicketDto>.Ok(new PrintTicketDto(
            ApplicationId:      app.Id,
            TokenNumber:        tokenNumber,
            ApplicantName:      fullName,
            Gender:             app.Gender == 'M' ? "Male" : app.Gender == 'F' ? "Female" : "Other",
            Age:                app.Age,
            DateOfBirth:        app.DateOfBirth,
            BloodGroup:         app.BloodGroup?.Trim() ?? "—",
            MobileNumber:       app.MobileNumber,
            Address:            app.AddressId == "DEFAULT" ? "—" : app.AddressId,
            WeeklySatsangCentre: app.WeeklySatsangCentreId == "DEFAULT" ? "—" : app.WeeklySatsangCentreId,
            SerialNumber:       serial?.ApplicationSrNo ?? 0,
            ApplicationCentreId: app.ApplicationCentreId,
            BatchCode:          app.ApplicationBatchCode?.Trim() ?? "—",
            ApplicationDate:    app.ApplicationDate,
            MedicalInfo: new MedicalInfoDto(
                IsDiabetes:     app.IsDiabetes   == 'Y',
                IsHypertension: app.IsHypertension == 'Y',
                IsCAD:          app.IsCAD         == 'Y',
                MedicalProblem: app.MedicalProblem,
                DrugAllergies:  app.DrugAllergies
            ),
            IsAttendantAllowed: app.IsAttendantAllowed == 'Y',
            AttendantName:      app.AttendantName,
            ApplicationStatus:  app.ApplicationStatus
        ));
    }
}
