namespace OETicket.Domain.Enums;

/// <summary>
/// Represents the lifecycle status of a card application.
/// Values match the single-character codes stored in the database.
/// </summary>
public enum ApplicationStatus
{
    Pending = 'P',
    Approved = 'A',
    Rejected = 'R',
    Hold = 'H'
}
