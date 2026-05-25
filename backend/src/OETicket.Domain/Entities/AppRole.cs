using Microsoft.AspNetCore.Identity;

namespace OETicket.Domain.Entities;

/// <summary>
/// Application role — extends ASP.NET Core Identity role.
/// Supports extensible role-based page access control.
/// </summary>
public sealed class AppRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
    public bool IsSystemRole { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<AppUserRole> UserRoles { get; set; } = [];
    public ICollection<PagePermission> PagePermissions { get; set; } = [];
}
