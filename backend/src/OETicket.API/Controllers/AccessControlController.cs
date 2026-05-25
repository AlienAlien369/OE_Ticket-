using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OETicket.Application.Features.AccessControl.Commands;
using OETicket.Application.Features.AccessControl.Queries;

namespace OETicket.API.Controllers;

[ApiController]
[Route("api/v1/access-control")]
[Authorize(Roles = "super_admin")]
[Produces("application/json")]
public sealed class AccessControlController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Returns the full page-permission matrix (all roles × all pages).
    /// Super admin only.
    /// </summary>
    [HttpGet("matrix")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMatrix(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetPagePermissionMatrixQuery(),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Upserts a page permission for a given role.
    /// Pass <c>isEnabled: true</c> to grant access, <c>false</c> to revoke.
    /// Super admin only.
    /// </summary>
    [HttpPut("permissions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpsertPermission(
        [FromBody] UpsertPermissionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpsertPagePermissionCommand(
                request.RoleName,
                request.PageKey,
                request.PageDisplayName,
                request.IsEnabled),
            cancellationToken);

        return result.Success ? Ok(result) : BadRequest(result);
    }
}

public sealed record UpsertPermissionRequest(
    string RoleName,
    string PageKey,
    string PageDisplayName,
    bool IsEnabled
);
