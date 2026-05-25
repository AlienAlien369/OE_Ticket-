namespace OETicket.Application.Features.CardApplications.DTOs;

/// <summary>Payload for saving a profile photo.</summary>
public sealed record SavePhotoDto(string PhotoBase64);

public sealed record CardApplicationDto(
    long Id,
    DateOnly ApplicationDate,
    char ApplicationType,
    string ApplicationBatchCode,
    string? Title,
    string GivenName,
    string? FamilyName,
    string? MiddleName,
    char Gender,
    int Age,
    DateOnly? DateOfBirth,
    string MobileNumber,
    string? Email,
    string BloodGroup,
    string? MedicalProblem,
    char IsDiabetes,
    char IsHypertension,
    char IsCAD,
    char ApplicationStatus,
    bool IsCardGenerated,
    string ApplicationCentreId,
    string CreatedBy,
    DateTime CreatedOn
);

/// <summary>
/// Simplified DTO for the "New Token" form — only the fields the operator enters.
/// Server-side defaults fill in all legacy required columns.
/// </summary>
public sealed record NewTokenRequestDto(
    string FirstName,
    string? MiddleName,
    string LastName,
    /// <summary>Male | Female | Other</summary>
    string Gender,
    string DateOfBirth,          // ISO date string e.g. "1985-07-15"
    int Age,
    string MobileNumber,
    string? AadhaarNumber        // maps to UID (12-digit)
);

public sealed record CreateCardApplicationDto(
    DateOnly ApplicationDate,
    char ApplicationType,
    string ApplicationBatchCode,
    string? Title,
    string GivenName,
    string? FamilyName,
    string? MiddleName,
    string? CareOfName,
    char Gender,
    int Age,
    DateOnly? DateOfBirth,
    string AddressId,
    string MobileNumber,
    string? EmergencyNumber,
    string? Email,
    string WeeklySatsangCentreId,
    string? MedicalProblem,
    char IsDiabetes,
    char IsHypertension,
    char IsCAD,
    string BloodGroup,
    char? IsAttendantAllowed,
    string? AttendantName,
    string? DrugAllergies,
    string? Remark,
    char IsOldCardAttached,
    string ApplicationCentreId,
    string? Uid
);
