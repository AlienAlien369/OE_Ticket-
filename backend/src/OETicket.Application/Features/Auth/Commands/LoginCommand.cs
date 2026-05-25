using MediatR;
using Microsoft.AspNetCore.Identity;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;
using OETicket.Application.Features.Auth.DTOs;
using OETicket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace OETicket.Application.Features.Auth.Commands;

// ── Command ────────────────────────────────────────────────────────────────
public sealed record LoginCommand(string UsernameOrEmail, string Password)
    : IRequest<ApiResponse<AuthResponseDto>>;

// ── Handler ────────────────────────────────────────────────────────────────
public sealed class LoginCommandHandler(
    UserManager<AppUser> userManager,
    IJwtTokenService jwtTokenService,
    IApplicationDbContext dbContext)
    : IRequestHandler<LoginCommand, ApiResponse<AuthResponseDto>>
{
    public async Task<ApiResponse<AuthResponseDto>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken)
    {
        // Resolve by email or username
        var user = request.UsernameOrEmail.Contains('@')
            ? await userManager.FindByEmailAsync(request.UsernameOrEmail)
            : await userManager.FindByNameAsync(request.UsernameOrEmail);

        if (user is null || !user.IsActive)
            return ApiResponse<AuthResponseDto>.Fail("Invalid credentials.");

        var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            return ApiResponse<AuthResponseDto>.Fail("Invalid credentials.");

        var roles = (await userManager.GetRolesAsync(user)).ToList();

        // Collect accessible pages for all roles the user belongs to
        var roleNames = roles.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var accessiblePages = await dbContext.PagePermissions
            .Where(p => p.IsEnabled && roleNames.Contains(p.Role.Name!))
            .Select(p => p.PageKey)
            .Distinct()
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
        ), "Login successful.");
    }
}
