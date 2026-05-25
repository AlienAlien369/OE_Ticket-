using Microsoft.AspNetCore.Identity;

namespace OETicket.Domain.Entities;

/// <summary>
/// Application user — extends ASP.NET Core Identity user.
/// Stores profile information and is linked to an application role.
/// </summary>
public sealed class AppUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedOn { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<AppUserRole> UserRoles { get; set; } = [];
}
