using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace ChatApp.Models
{
  public class User : IdentityUser<int>
  {
    public string Avatar { get; set; }
    public string FullName { get; set; }
    public int UptimeMinutes { get; set; } = 60; // Default 30 minutes
  }
}
