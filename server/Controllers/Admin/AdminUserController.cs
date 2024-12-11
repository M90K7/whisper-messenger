using ChatApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers.Admin;

[Authorize(Roles = "admin", AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/user/admin")]
public class AdminUserController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public AdminUserController(
        UserManager<User> userManager,
        RoleManager<IdentityRole<int>> roleManager
    )
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpPost()]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = new User
        {
            UserName = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            Avatar = request.Avatar,
            UptimeMinutes = request.UptimeMinutes
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        await _userManager.AddToRoleAsync(user, request.Role);
        return Ok(user);
    }

    [HttpPut("edit/{id}")]
    public async Task<IActionResult> EditProfile(int id, [FromBody] EditProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
            return NotFound();

        user.FullName = request.FullName;
        user.Avatar = request.Avatar;
        user.Email = request.Email;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(user);
    }

    [HttpGet]
    public async Task<IActionResult> ListUsers()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .Select(
                (user) =>
                    new
                    {
                        User = user,
                        role = _userManager.GetRolesAsync(user).Result.ToArray().FirstOrDefault()
                    }
            )
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = int.Parse(User.Identity.Name);
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
            return NotFound();

        // Update user properties
        user.UserName = request.Username ?? user.UserName;
        user.FullName = request.DisplayName ?? user.FullName;

        if (!string.IsNullOrEmpty(request.Password))
        {
            var result = await _userManager.ChangePasswordAsync(
                user,
                request.CurrentPassword,
                request.Password
            );
            if (!result.Succeeded)
                return BadRequest(result.Errors);
        }

        // Save updated user
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return BadRequest(updateResult.Errors);

        return Ok(new { message = "Profile updated successfully!" });
    }
}
