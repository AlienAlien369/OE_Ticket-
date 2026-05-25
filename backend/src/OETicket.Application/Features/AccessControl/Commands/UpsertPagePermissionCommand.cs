using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;
using OETicket.Domain.Entities;

namespace OETicket.Application.Features.AccessControl.Commands;

// ── Command ────────────────────────────────────────────────────────────────
public sealed record UpsertPagePermissionCommand(
    string RoleName,
    string PageKey,
    string PageDisplayName,
    bool IsEnabled)
    : IRequest<ApiResponse<bool>>;

// ── Handler ────────────────────────────────────────────────────────────────
public sealed class UpsertPagePermissionCommandHandler(
    IApplicationDbContext dbContext,
    RoleManager<AppRole> roleManager,
    ICurrentUserService currentUserService)
    : IRequestHandler<UpsertPagePermissionCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        UpsertPagePermissionCommand request,
        CancellationToken cancellationToken)
    {
        var role = await roleManager.FindByNameAsync(request.RoleName);
        if (role is null)
            return ApiResponse<bool>.Fail($"Role '{request.RoleName}' not found.");

        var existing = await dbContext.PagePermissions
            .FirstOrDefaultAsync(
                p => p.RoleId == role.Id && p.PageKey == request.PageKey,
                cancellationToken);

        if (existing is not null)
        {
            existing.IsEnabled = request.IsEnabled;
            existing.AssignedOn = DateTime.UtcNow;
            existing.AssignedBy = currentUserService.UserName ?? "system";
        }
        else
        {
            dbContext.PagePermissions.Add(new PagePermission
            {
                RoleId = role.Id,
                PageKey = request.PageKey,
                PageDisplayName = request.PageDisplayName,
                IsEnabled = request.IsEnabled,
                AssignedOn = DateTime.UtcNow,
                AssignedBy = currentUserService.UserName ?? "system"
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Ok(true, "Page permission updated.");
    }
}
