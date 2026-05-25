using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OETicket.Application.Features.Print.Queries;

namespace OETicket.API.Controllers;

[ApiController]
[Route("api/v1/print")]
[Authorize]
[Produces("application/json")]
public sealed class PrintController(IMediator mediator) : ControllerBase
{
    /// <summary>Returns print ticket data for a given card application.</summary>
    [HttpGet("{applicationId:long}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPrintTicket(
        long applicationId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetPrintTicketQuery(applicationId),
            cancellationToken);

        return result.Success ? Ok(result) : NotFound(result);
    }
}
