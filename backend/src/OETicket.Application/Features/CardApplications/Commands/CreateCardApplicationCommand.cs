using MediatR;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;
using OETicket.Application.Features.CardApplications.DTOs;
using OETicket.Domain.Entities;

namespace OETicket.Application.Features.CardApplications.Commands;

// ── Command ────────────────────────────────────────────────────────────────
public sealed record CreateCardApplicationCommand(CreateCardApplicationDto Dto)
    : IRequest<ApiResponse<long>>;

// ── Handler ────────────────────────────────────────────────────────────────
public sealed class CreateCardApplicationCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<CreateCardApplicationCommand, ApiResponse<long>>
{
    public async Task<ApiResponse<long>> Handle(
        CreateCardApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        var now = DateTime.UtcNow;
        var user = currentUserService.UserName ?? "system";

        var application = new CardApplication
        {
            ApplicationDate = dto.ApplicationDate,
            ApplicationType = dto.ApplicationType,
            ApplicationBatchCode = dto.ApplicationBatchCode,
            Title = dto.Title,
            GivenName = dto.GivenName,
            FamilyName = dto.FamilyName,
            MiddleName = dto.MiddleName,
            CareOfName = dto.CareOfName,
            Gender = dto.Gender,
            Age = dto.Age,
            DateOfBirth = dto.DateOfBirth,
            AddressId = dto.AddressId,
            MobileNumber = dto.MobileNumber,
            EmergencyNumber = dto.EmergencyNumber,
            Email = dto.Email,
            WeeklySatsangCentreId = dto.WeeklySatsangCentreId,
            MedicalProblem = dto.MedicalProblem,
            IsDiabetes = dto.IsDiabetes,
            IsHypertension = dto.IsHypertension,
            IsCAD = dto.IsCAD,
            BloodGroup = dto.BloodGroup,
            IsAttendantAllowed = dto.IsAttendantAllowed,
            AttendantName = dto.AttendantName,
            DrugAllergies = dto.DrugAllergies,
            Remark = dto.Remark,
            ApplicationStatus = 'P',
            IsOldCardAttached = dto.IsOldCardAttached,
            ApplicationCentreId = dto.ApplicationCentreId,
            IsCardGenerated = false,
            RecordStatus = 'A',
            Uid = dto.Uid,
            CreatedBy = user,
            CreatedOn = now,
            UpdatedBy = user,
            UpdatedOn = now
        };

        dbContext.CardApplications.Add(application);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ApiResponse<long>.Ok(application.Id, "Card application created successfully.");
    }
}
