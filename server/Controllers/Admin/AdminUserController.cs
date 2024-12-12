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
        if (!await _roleManager.RoleExistsAsync(request.Role))
        {
            return BadRequest("Role not found");
        }

        var user = new User
        {
            UserName = request.UserName,
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

    [HttpGet]
    public async Task<IActionResult> ListUsers()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .Select((user) => UserDto.FromUser(user, _userManager.GetRolesAsync(user).Result.ToArray().FirstOrDefault()))
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] CreateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(request.Id.ToString());

        if (user == null)
            return NotFound();

        if (!await _roleManager.RoleExistsAsync(request.Role))
        {
            return BadRequest("Role not found");
        }

        if (!await _userManager.IsInRoleAsync(user, request.Role))
        {
            var roleResult = await _userManager.AddToRoleAsync(user, request.Role);
            if (!roleResult.Succeeded)
                return BadRequest(roleResult.Errors);
        }

        // Update user properties
        user.UserName = request.UserName ?? user.UserName;
        user.FullName = request.FullName ?? user.FullName;
        user.Email = request.Email ?? user.Email;
        user.UptimeMinutes = request.UptimeMinutes;

        if (!string.IsNullOrEmpty(request.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(
                user,
                token,
                request.Password
            );
            if (!result.Succeeded)
                return BadRequest(result.Errors);
        }

        // Save updated user
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return BadRequest(updateResult.Errors);

        return Ok(UserDto.FromUser(user, string.IsNullOrEmpty(request.Role) ? _userManager.GetRolesAsync(user).Result.ToArray().FirstOrDefault() : request.Role));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] int id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null)
        {
            return BadRequest("");
        }

        var result = await _userManager.DeleteAsync(user);

        return Ok(result.Succeeded);
    }
}
