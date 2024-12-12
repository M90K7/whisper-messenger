using ChatApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly OnlineUserService _onlineUserSvc;

        public UserController(
            UserManager<User> userManager,
            RoleManager<IdentityRole<int>> roleManager,
            OnlineUserService onlineUserSvc
        )
        {
            _userManager = userManager;
            _roleManager = roleManager;
            this._onlineUserSvc = onlineUserSvc;
        }

        [HttpGet]
        public async Task<IActionResult> ListUsers()
        {
            var users = await _userManager.Users
                .Select(
                    user => UserDto.FromUser(user, _onlineUserSvc.IsOnlineUser(user.Id.ToString()))
                )
                .ToListAsync();

            var currentUserName = User.Identity?.Name;
            users = users.Where(u => u.UserName.ToString() != currentUserName).ToList();

            return Ok(users);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.Id.ToString());

            if (user == null)
                return NotFound();

            // Update user properties
            user.UserName = request.UserName ?? user.UserName;
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

            return Ok(UserDto.FromUser(user, true));
        }
    }

    public class CreateUserRequest
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public string Avatar { get; set; }
        public int UptimeMinutes { get; set; }
    }

    public class EditProfileRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Avatar { get; set; }
    }

    public class UpdateProfileRequest
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string CurrentPassword { get; set; } // For password updates
    }
}
