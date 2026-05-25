using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;
using OETicket.Application.Features.AccessControl.DTOs;
using OETicket.Domain.Entities;

namespace OETicket.Application.Features.AccessControl.Queries;

// ── Query ──────────────────────────────────────────────────────────────────
public sealed record GetPagePermissionMatrixQuery : IRequest<ApiResponse<PagePermissionMatrixDto>>;

// ── Handler ────────────────────────────────────────────────────────────────
public sealed class GetPagePermissionMatrixQueryHandler(
    IApplicationDbContext dbContext,
    RoleManager<AppRole> roleManager)
    : IRequestHandler<GetPagePermissionMatrixQuery, ApiResponse<PagePermissionMatrixDto>>
{
    /// <summary>The master page catalogue — add new pages here as the app grows.</summary>
    private static readonly IReadOnlyList<PageDefinitionDto> AllPages =
    [
        new("new-token",      "New Token",      false),
        new("print",          "Print",          false),
        new("access-control", "Access Control", true)
    ];

    public async Task<ApiResponse<PagePermissionMatrixDto>> Handle(
        GetPagePermissionMatrixQuery request,
        CancellationToken cancellationToken)
    {
        var roles = await roleManager.Roles
            .Select(r => r.Name!)
            .ToListAsync(cancellationToken);

        var permissions = await dbContext.PagePermissions
            .Include(p => p.Role)
            .Select(p => new PagePermissionDto(
                p.Id, p.RoleId.ToString(), p.Role.Name!,
                p.PageKey, p.PageDisplayName, p.IsEnabled,
                p.AssignedOn, p.AssignedBy))
            .ToListAsync(cancellationToken);

        return ApiResponse<PagePermissionMatrixDto>.Ok(
            new PagePermissionMatrixDto(roles, AllPages, permissions));
    }
}
