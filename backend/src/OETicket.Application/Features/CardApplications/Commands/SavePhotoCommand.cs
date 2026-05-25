using MediatR;
using Microsoft.EntityFrameworkCore;
using OETicket.Application.Common.Interfaces;
using OETicket.Application.Common.Models;

namespace OETicket.Application.Features.CardApplications.Commands;

public sealed record SavePhotoCommand(long ApplicationId, string PhotoBase64)
    : IRequest<ApiResponse<bool>>;

public sealed class SavePhotoCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<SavePhotoCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        SavePhotoCommand request,
        CancellationToken cancellationToken)
    {
        var app = await dbContext.CardApplications
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, cancellationToken);

        if (app is null)
            return ApiResponse<bool>.Fail("Application not found.");

        app.PhotoData  = request.PhotoBase64;
        app.UpdatedBy  = (currentUserService.UserName ?? "system")[..Math.Min((currentUserService.UserName ?? "system").Length, 25)];
        app.UpdatedOn  = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Ok(true, "Photo saved successfully.");
    }
}
