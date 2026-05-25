using OETicket.Domain.Common;

namespace OETicket.Domain.Entities;

/// <summary>
/// Represents a card application submitted by a user at an application centre.
/// Maps directly to the CardApplications table in the database.
/// </summary>
public sealed class CardApplication : AuditableEntity
{
    public long Id { get; set; }
    public DateOnly ApplicationDate { get; set; }

    /// <summary>N = New, R = Renewal, L = Lost/Replacement</summary>
    public char ApplicationType { get; set; }

    public string ApplicationBatchCode { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string GivenName { get; set; } = string.Empty;
    public string? FamilyName { get; set; }
    public string? MiddleName { get; set; }
    public string? CareOfName { get; set; }
    public string? CareOfRelationId { get; set; }

    /// <summary>M = Male, F = Female, O = Other</summary>
    public char Gender { get; set; }

    public int Age { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string AddressId { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string? EmergencyNumber { get; set; }
    public string? Phone1 { get; set; }
    public string? Phone2 { get; set; }
    public string? Email { get; set; }
    public string WeeklySatsangCentreId { get; set; } = string.Empty;
    public string? MedicalProblem { get; set; }

    /// <summary>Y = Yes, N = No</summary>
    public char IsDiabetes { get; set; }
    public char IsHypertension { get; set; }
    public char IsCAD { get; set; }
    public string BloodGroup { get; set; } = string.Empty;
    public char? IsAttendantAllowed { get; set; }
    public string? AttendantName { get; set; }
    public string? DrugAllergies { get; set; }
    public string? Remark { get; set; }

    /// <summary>P = Pending, A = Approved, R = Rejected, H = Hold</summary>
    public char ApplicationStatus { get; set; } = 'P';

    public string? ApprovedById { get; set; }
    public string? VerifiedById { get; set; }

    /// <summary>Y = Yes, N = No</summary>
    public char IsOldCardAttached { get; set; }
    public string ApplicationCentreId { get; set; } = string.Empty;
    public bool IsCardGenerated { get; set; }

    /// <summary>A = Active, I = Inactive, D = Deleted</summary>
    public char RecordStatus { get; set; } = 'A';

    public string? Uid { get; set; }
    public string? ReasonForEdit { get; set; }
    public bool? IsQCDone { get; set; }
    public string? QCDoneBy { get; set; }
    public DateTime? QCDoneOn { get; set; }
    public string? AssignQCTo { get; set; }
    public DateTime? AssignQCOn { get; set; }
    public string? AssignMQTo { get; set; }
    public DateTime? AssignMCOn { get; set; }

    // Navigation
    public ICollection<ApplicationCentreSerial> CentreSerials { get; set; } = [];
}
