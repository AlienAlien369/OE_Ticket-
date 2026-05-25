namespace OETicket.Domain.Entities;

/// <summary>
/// Tracks the serial number assigned to an application at a specific centre on a given date.
/// Maps directly to the ApplicationCentreSerial table.
/// </summary>
public sealed class ApplicationCentreSerial
{
    public int ApplicationSrNo { get; set; }
    public string ApplicationCentreId { get; set; } = string.Empty;
    public DateOnly ApplicationDate { get; set; }
    public long ApplicationId { get; set; }
    public string UserId { get; set; } = string.Empty;

    // Navigation
    public CardApplication CardApplication { get; set; } = null!;
}
