using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OETicket.Domain.Entities;

namespace OETicket.Infrastructure.Persistence.Configurations;

public sealed class CardApplicationConfiguration : IEntityTypeConfiguration<CardApplication>
{
    public void Configure(EntityTypeBuilder<CardApplication> builder)
    {
        builder.ToTable("card_applications");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedNever();

        builder.Property(a => a.ApplicationType).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.ApplicationBatchCode).HasMaxLength(15).IsFixedLength().IsRequired();
        builder.Property(a => a.Title).HasMaxLength(5).IsFixedLength();
        builder.Property(a => a.GivenName).HasMaxLength(50).IsRequired();
        builder.Property(a => a.FamilyName).HasMaxLength(50);
        builder.Property(a => a.MiddleName).HasMaxLength(50);
        builder.Property(a => a.CareOfName).HasMaxLength(100);
        builder.Property(a => a.CareOfRelationId).HasMaxLength(25);
        builder.Property(a => a.Gender).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.AddressId).HasMaxLength(25).IsRequired();
        builder.Property(a => a.MobileNumber).HasMaxLength(15).IsRequired();
        builder.Property(a => a.EmergencyNumber).HasMaxLength(15);
        builder.Property(a => a.Phone1).HasMaxLength(15);
        builder.Property(a => a.Phone2).HasMaxLength(15);
        builder.Property(a => a.Email).HasMaxLength(150);
        builder.Property(a => a.WeeklySatsangCentreId).HasMaxLength(50).IsRequired();
        builder.Property(a => a.MedicalProblem).HasMaxLength(250);
        builder.Property(a => a.IsDiabetes).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.IsHypertension).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.IsCAD).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.BloodGroup).HasMaxLength(4).IsFixedLength().IsRequired();
        builder.Property(a => a.IsAttendantAllowed).HasMaxLength(1).IsFixedLength();
        builder.Property(a => a.AttendantName).HasMaxLength(50);
        builder.Property(a => a.DrugAllergies).HasMaxLength(150);
        builder.Property(a => a.Remark).HasMaxLength(255);
        builder.Property(a => a.ApplicationStatus).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.ApprovedById).HasMaxLength(25);
        builder.Property(a => a.VerifiedById).HasMaxLength(25);
        builder.Property(a => a.IsOldCardAttached).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.ApplicationCentreId).HasMaxLength(50).IsRequired();
        builder.Property(a => a.RecordStatus).HasMaxLength(1).IsFixedLength().IsRequired();
        builder.Property(a => a.CreatedBy).HasMaxLength(25).IsRequired();
        builder.Property(a => a.UpdatedBy).HasMaxLength(25).IsRequired();
        builder.Property(a => a.Uid).HasMaxLength(12).IsFixedLength();
        builder.Property(a => a.QCDoneBy).HasMaxLength(50);
        builder.Property(a => a.AssignQCTo).HasMaxLength(50);
        builder.Property(a => a.AssignMQTo).HasMaxLength(50);

        builder.HasMany(a => a.CentreSerials)
            .WithOne(s => s.CardApplication)
            .HasForeignKey(s => s.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
