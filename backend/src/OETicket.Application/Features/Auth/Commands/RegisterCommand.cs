using MediatR;
using Microsoft.AspNetCore.Identity;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;
using OETicket.Application.Features.Auth.DTOs;
using OETicket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace OETicket.Application.Features.Auth.Commands;

// ── Command ────────────────────────────────────────────────────────────────
public sealed record RegisterCommand(
    string Username,
    string Email,
    string Password,
    string FirstName,
    string LastName)
    : IRequest<ApiResponse<AuthResponseDto>>;

// ── Handler ────────────────────────────────────────────────────────────────
public sealed class RegisterCommandHandler(
    UserManager<AppUser> userManager,
    RoleManager<AppRole> roleManager,
    IJwtTokenService jwtTokenService,
    IApplicationDbContext dbContext)
    : IRequestHandler<RegisterCommand, ApiResponse<AuthResponseDto>>
{
    private const string DefaultRole = "default";

    public async Task<ApiResponse<AuthResponseDto>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken)
    {
        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return ApiResponse<AuthResponseDto>.Fail("A user with this email already exists.");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            UpdatedOn = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = createResult.Errors.Select(e => e.Description).ToList();
            return ApiResponse<AuthResponseDto>.Fail("Registration failed.", errors);
        }

        // Assign default role — create if it doesn't exist
        if (!await roleManager.RoleExistsAsync(DefaultRole))
            await roleManager.CreateAsync(new AppRole
            {
                Id = Guid.NewGuid(),
                Name = DefaultRole,
                NormalizedName = DefaultRole.ToUpperInvariant(),
                Description = "Default user role",
                IsSystemRole = true
            });

        await userManager.AddToRoleAsync(user, DefaultRole);

        var roles = new List<string> { DefaultRole };
        var accessiblePages = await dbContext.PagePermissions
            .Where(p => p.IsEnabled && p.Role.Name == DefaultRole)
            .Select(p => p.PageKey)
            .ToListAsync(cancellationToken);

        var token = jwtTokenService.GenerateAccessToken(
            user.Id.ToString(), user.Email!, user.UserName!, roles);

        return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto(
            AccessToken: token,
            Username: user.UserName!,
            Email: user.Email!,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Roles: roles,
            AccessiblePages: accessiblePages
        ), "Registration successful.");
    }
}
