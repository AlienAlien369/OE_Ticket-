using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OETicket.Application.Features.CardApplications.Commands;
using OETicket.Application.Features.CardApplications.DTOs;
using OETicket.Application.Features.CardApplications.Queries;

namespace OETicket.API.Controllers;

[ApiController]
[Route("api/v1/card-applications")]
[Authorize]
[Produces("application/json")]
public sealed class CardApplicationsController(IMediator mediator) : ControllerBase
{
    /// <summary>Returns a paginated list of card applications.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] char? status = null,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetCardApplicationsQuery(pageNumber, pageSize, search, status),
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Creates a new card token application from the New Token form.
    /// Accepts a simple flat payload — server fills in legacy required fields with defaults.
    /// Returns the generated application ID and formatted token number.
    /// </summary>
    [HttpPost("new-token")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateNewToken(
        [FromBody] NewTokenRequestDto dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateNewTokenCommand(dto), cancellationToken);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetAll), new { id = result.Data!.ApplicationId }, result);
    }

    /// <summary>Creates a full card application with all fields (advanced use).</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCardApplicationDto dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateCardApplicationCommand(dto),
            cancellationToken);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetAll), new { id = result.Data }, result);
    }
}
