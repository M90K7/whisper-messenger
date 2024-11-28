using ChatApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers
{
  [Authorize(Roles = "Admin")]
  [ApiController]
  [Route("api/[controller]")]
  public class UserController : ControllerBase
  {
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public UserController(UserManager<User> userManager, RoleManager<IdentityRole<int>> roleManager)
    {
      _userManager = userManager;
      _roleManager = roleManager;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
      var user = new User
      {
        UserName = request.Username,
        Email = request.Email,
        FullName = request.FullName,
        Avatar = request.Avatar,
        UptimeMinutes = request.UptimeMinutes,
      };

      var result = await _userManager.CreateAsync(user, request.Password);
      if (!result.Succeeded)
      {
        return BadRequest(result.Errors);
      }

      await _userManager.AddToRoleAsync(user, request.Role);
      return Ok(user);
    }

    [HttpPut("{id}/edit")]
    public async Task<IActionResult> EditProfile(int id, [FromBody] EditProfileRequest request)
    {
      var user = await _userManager.FindByIdAsync(id.ToString());
      if (user == null) return NotFound();

      user.FullName = request.FullName;
      user.Avatar = request.Avatar;
      user.Email = request.Email;

      var result = await _userManager.UpdateAsync(user);
      if (!result.Succeeded) return BadRequest(result.Errors);

      return Ok(user);
    }

    [HttpGet("list")]
    public async Task<IActionResult> ListUsers()
    {
      var users = await _userManager.Users.Select(user => new
      {
        user.Id,
        user.UserName,
        user.FullName,
        user.Avatar,
        Online = ChatHub.GetOnlineUsers().Contains(user.Id.ToString())
      }).ToListAsync();

      var currentUserId = User.Identity?.Name;
      users = users.Where(u => u.Id.ToString() != currentUserId).ToList();

      return Ok(users);
    }
  }

  public class CreateUserRequest
  {
    public string Username { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }
    public string? Avatar { get; set; }
    public int UptimeMinutes { get; set; }
  }

  public class EditProfileRequest
  {
    public string FullName { get; set; }
    public string Email { get; set; }
    public string? Avatar { get; set; }
  }
}
