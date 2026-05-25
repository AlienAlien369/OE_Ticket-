using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OETicket.Domain.Entities;

namespace OETicket.Infrastructure.Persistence.Configurations;

public sealed class ApplicationCentreSerialConfiguration
    : IEntityTypeConfiguration<ApplicationCentreSerial>
{
    public void Configure(EntityTypeBuilder<ApplicationCentreSerial> builder)
    {
        builder.ToTable("application_centre_serials");
        builder.HasKey(s => new { s.ApplicationSrNo, s.ApplicationCentreId });

        builder.Property(s => s.ApplicationCentreId).HasMaxLength(25).IsRequired();
        builder.Property(s => s.UserId).HasMaxLength(25).IsRequired();
    }
}
