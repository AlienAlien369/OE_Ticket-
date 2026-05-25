namespace OETicket.Application.Features.Print.DTOs;

public sealed record PrintTicketDto(
    long ApplicationId,
    string TokenNumber,
    string Name,
    string Gender,
    int Age,
    string MobileNumber,
    string? BloodGroup,
    string ApplicationCentreId,
    DateOnly ApplicationDate,
    int SerialNumber,
    string? MedicalProblem,
    char IsDiabetes,
    char IsHypertension,
    char IsCAD,
    char ApplicationStatus
);
