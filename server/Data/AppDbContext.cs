using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ChatApp.Models;

namespace ChatApp.Data
{
  public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Message> Messages { get; set; }

    public DbSet<ActiveDirectory> ActiveDirectories { get; set; }

    public DbSet<AppSetting> AppSettings { get; set; }
  }
}
