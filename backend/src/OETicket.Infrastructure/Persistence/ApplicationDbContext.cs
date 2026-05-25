using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OETicket.Application.Common.Interfaces;
using OETicket.Domain.Entities;

namespace OETicket.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<AppUser, AppRole, Guid,
        Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>,
        AppUserRole,
        Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>,
        Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>,
        Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>(options),
      IApplicationDbContext
{
    public DbSet<CardApplication> CardApplications => Set<CardApplication>();
    public DbSet<ApplicationCentreSerial> ApplicationCentreSerials => Set<ApplicationCentreSerial>();
    public DbSet<PagePermission> PagePermissions => Set<PagePermission>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
