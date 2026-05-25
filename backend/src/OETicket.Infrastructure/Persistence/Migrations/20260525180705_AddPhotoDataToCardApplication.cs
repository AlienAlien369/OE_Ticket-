using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OETicket.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoDataToCardApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoData",
                table: "card_applications",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PhotoData",
                table: "card_applications");
        }
    }
}
