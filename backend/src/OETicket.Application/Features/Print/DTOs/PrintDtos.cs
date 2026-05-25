namespace OETicket.Application.Features.Print.DTOs;

public sealed record MedicalInfoDto(
    bool IsDiabetes,
    bool IsHypertension,
    bool IsCAD,
    string? MedicalProblem,
    string? DrugAllergies
);

public sealed record PrintTicketDto(
    long ApplicationId,
    string TokenNumber,
    string ApplicantName,
    string Gender,
    int Age,
    DateOnly? DateOfBirth,
    string BloodGroup,
    string MobileNumber,
    string Address,
    string WeeklySatsangCentre,
    int SerialNumber,
    string ApplicationCentreId,
    string BatchCode,
    DateOnly ApplicationDate,
    MedicalInfoDto MedicalInfo,
    bool IsAttendantAllowed,
    string? AttendantName,
    char ApplicationStatus
);
