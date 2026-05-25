using Microsoft.EntityFrameworkCore;
using OETicket.Domain.Entities;

namespace OETicket.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<CardApplication> CardApplications { get; }
    DbSet<ApplicationCentreSerial> ApplicationCentreSerials { get; }
    DbSet<PagePermission> PagePermissions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
