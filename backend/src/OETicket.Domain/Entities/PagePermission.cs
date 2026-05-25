namespace OETicket.Domain.Entities;

/// <summary>
/// Controls which pages a role is permitted to access.
/// Super admin manages these assignments via the Access Control screen.
/// </summary>
public sealed class PagePermission
{
    public int Id { get; set; }

    /// <summary>Foreign key to AppRole.</summary>
    public Guid RoleId { get; set; }

    /// <summary>
    /// Logical page key — e.g. "new-token", "print", "access-control".
    /// Matches the route segments used in the frontend.
    /// </summary>
    public string PageKey { get; set; } = string.Empty;

    /// <summary>Human-readable page display name.</summary>
    public string PageDisplayName { get; set; } = string.Empty;

    public bool IsEnabled { get; set; } = true;
    public DateTime AssignedOn { get; set; } = DateTime.UtcNow;
    public string AssignedBy { get; set; } = string.Empty;

    // Navigation
    public AppRole Role { get; set; } = null!;
}
