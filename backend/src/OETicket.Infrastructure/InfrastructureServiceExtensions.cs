using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OETicket.Application.Common.Interfaces;
using OETicket.Domain.Entities;
using OETicket.Infrastructure.Persistence;
using OETicket.Infrastructure.Services;

namespace OETicket.Infrastructure;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── PostgreSQL + EF Core ───────────────────────────────────────────
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>());

        // ── ASP.NET Core Identity ──────────────────────────────────────────
        services.AddIdentityCore<AppUser>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<AppRole>()
        .AddUserStore<Microsoft.AspNetCore.Identity.EntityFrameworkCore.UserStore<AppUser, AppRole, ApplicationDbContext, Guid, 
            Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>,
            AppUserRole,
            Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>,
            Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>,
            Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>>()
        .AddRoleStore<Microsoft.AspNetCore.Identity.EntityFrameworkCore.RoleStore<AppRole, ApplicationDbContext, Guid,
            AppUserRole,
            Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>>()
        .AddDefaultTokenProviders();

        // ── Services ──────────────────────────────────────────────────────
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}
