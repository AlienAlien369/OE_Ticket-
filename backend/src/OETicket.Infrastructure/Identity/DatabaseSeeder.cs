using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using OETicket.Domain.Entities;
using OETicket.Infrastructure.Persistence;

namespace OETicket.Infrastructure.Identity;

/// <summary>
/// Seeds the database with system roles, super-admin user, and default page permissions.
/// Runs on application startup only if data is missing.
/// </summary>
public static class DatabaseSeeder
{
    private const string SuperAdminUsername = "super_admin";
    private const string SuperAdminPassword = "super_admin@123";
    private const string SuperAdminEmail = "superadmin@oeticket.com";
    private const string SuperAdminRole = "super_admin";
    private const string DefaultRole = "default";

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<AppRole>>();

            await context.Database.MigrateAsync();
            await SeedRolesAsync(roleManager, logger);
            await SeedSuperAdminAsync(userManager, logger);
            await SeedPagePermissionsAsync(context, roleManager, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during database seeding.");
            throw;
        }
    }

    private static async Task SeedRolesAsync(
        RoleManager<AppRole> roleManager,
        ILogger logger)
    {
        var roles = new[]
        {
            (SuperAdminRole, "Super Administrator — full system access", true),
            (DefaultRole,    "Default user — limited page access",       true)
        };

        foreach (var (name, description, isSystem) in roles)
        {
            if (!await roleManager.RoleExistsAsync(name))
            {
                var result = await roleManager.CreateAsync(new AppRole
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    NormalizedName = name.ToUpperInvariant(),
                    Description = description,
                    IsSystemRole = isSystem,
                    CreatedOn = DateTime.UtcNow
                });

                if (result.Succeeded)
                    logger.LogInformation("Created role: {Role}", name);
                else
                    logger.LogError("Failed to create role {Role}: {Errors}",
                        name, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
    }

    private static async Task SeedSuperAdminAsync(
        UserManager<AppUser> userManager,
        ILogger logger)
    {
        var existing = await userManager.FindByNameAsync(SuperAdminUsername);
        if (existing is not null) return;

        var superAdmin = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = SuperAdminUsername,
            NormalizedUserName = SuperAdminUsername.ToUpperInvariant(),
            Email = SuperAdminEmail,
            NormalizedEmail = SuperAdminEmail.ToUpperInvariant(),
            EmailConfirmed = true,
            FirstName = "Super",
            LastName = "Admin",
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            UpdatedOn = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(superAdmin, SuperAdminPassword);
        if (!result.Succeeded)
        {
            logger.LogError("Failed to create super_admin: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(superAdmin, SuperAdminRole);
        logger.LogInformation("Created super_admin user.");
    }

    private static async Task SeedPagePermissionsAsync(
        ApplicationDbContext context,
        RoleManager<AppRole> roleManager,
        ILogger logger)
    {
        // Page catalogue
        var allPages = new[]
        {
            ("new-token",      "New Token"),
            ("print",          "Print"),
            ("access-control", "Access Control")
        };

        // super_admin gets ALL pages
        var superAdminRole = await roleManager.FindByNameAsync(SuperAdminRole);
        if (superAdminRole is not null)
        {
            foreach (var (key, displayName) in allPages)
            {
                var exists = await context.PagePermissions
                    .AnyAsync(p => p.RoleId == superAdminRole.Id && p.PageKey == key);

                if (!exists)
                {
                    context.PagePermissions.Add(new PagePermission
                    {
                        RoleId = superAdminRole.Id,
                        PageKey = key,
                        PageDisplayName = displayName,
                        IsEnabled = true,
                        AssignedOn = DateTime.UtcNow,
                        AssignedBy = SuperAdminUsername
                    });
                }
            }
        }

        // default role gets new-token and print (not access-control)
        var defaultRole = await roleManager.FindByNameAsync(DefaultRole);
        if (defaultRole is not null)
        {
            var defaultPages = allPages.Where(p => p.Item1 != "access-control");
            foreach (var (key, displayName) in defaultPages)
            {
                var exists = await context.PagePermissions
                    .AnyAsync(p => p.RoleId == defaultRole.Id && p.PageKey == key);

                if (!exists)
                {
                    context.PagePermissions.Add(new PagePermission
                    {
                        RoleId = defaultRole.Id,
                        PageKey = key,
                        PageDisplayName = displayName,
                        IsEnabled = true,
                        AssignedOn = DateTime.UtcNow,
                        AssignedBy = SuperAdminUsername
                    });
                }
            }
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Page permissions seeded.");
    }
}
