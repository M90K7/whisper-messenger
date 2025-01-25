using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace whisper_messenger.Migrations
{
    /// <inheritdoc />
    public partial class AdColumnName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ActiveDirectories",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "ActiveDirectories");
        }
    }
}
