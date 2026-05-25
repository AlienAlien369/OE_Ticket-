using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OETicket.Domain.Entities;

namespace OETicket.Infrastructure.Persistence.Configurations;

public sealed class PagePermissionConfiguration : IEntityTypeConfiguration<PagePermission>
{
    public void Configure(EntityTypeBuilder<PagePermission> builder)
    {
        builder.ToTable("page_permissions");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).UseIdentityColumn();

        builder.Property(p => p.PageKey).HasMaxLength(100).IsRequired();
        builder.Property(p => p.PageDisplayName).HasMaxLength(200).IsRequired();
        builder.Property(p => p.AssignedBy).HasMaxLength(100).IsRequired();

        builder.HasIndex(p => new { p.RoleId, p.PageKey }).IsUnique();

        builder.HasOne(p => p.Role)
            .WithMany(r => r.PagePermissions)
            .HasForeignKey(p => p.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
