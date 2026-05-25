using MediatR;
using Microsoft.AspNetCore.Mvc;
using OETicket.Application.Features.Auth.Commands;
using OETicket.Application.Features.Auth.DTOs;

namespace OETicket.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
[Produces("application/json")]
public sealed class AuthController(IMediator mediator) : ControllerBase
{
    /// <summary>Authenticates a user and returns a JWT access token.</summary>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new LoginCommand(request.UsernameOrEmail, request.Password),
            cancellationToken);

        return result.Success ? Ok(result) : Unauthorized(result);
    }

    /// <summary>Registers a new user with the default role.</summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new RegisterCommand(
                request.Username,
                request.Email,
                request.Password,
                request.FirstName,
                request.LastName),
            cancellationToken);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(Login), result);
    }
}
