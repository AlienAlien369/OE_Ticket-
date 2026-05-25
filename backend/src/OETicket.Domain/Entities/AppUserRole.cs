using Microsoft.AspNetCore.Identity;

namespace OETicket.Domain.Entities;

/// <summary>
/// Join entity for the many-to-many relationship between AppUser and AppRole.
/// </summary>
public sealed class AppUserRole : IdentityUserRole<Guid>
{
    public AppUser User { get; set; } = null!;
    public AppRole Role { get; set; } = null!;
}
