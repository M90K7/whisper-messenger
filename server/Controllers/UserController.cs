using ChatApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration configuration;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly OnlineUserService _onlineUserSvc;
        private readonly IHubContext<ChatHub, IChatClient> _chatHubSvc;

        public UserController(
            IConfiguration configuration,
            IWebHostEnvironment hostEnvironment,
            IHubContext<ChatHub, IChatClient> chatHubSvc,
            UserManager<User> userManager,
            RoleManager<IdentityRole<int>> roleManager,
            OnlineUserService onlineUserSvc
        )
        {
            this.configuration = configuration;
            this._hostEnvironment = hostEnvironment;
            _chatHubSvc = chatHubSvc;
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

            var currentUserId = int.Parse(User.Identity.Name);
            users = users.Where(u => u.Id != currentUserId).ToList();

            return Ok(users);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var user = await _userManager.FindByIdAsync(User.Identity.Name);

            if (user == null)
                return NotFound();

            // Update user properties
            user.UserName = request.UserName ?? user.UserName;
            user.FullName = request.FullName ?? user.FullName;

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

            var uDto = UserDto.FromUser(user, true);

            await _onlineUserSvc.SendToAllUserWithExceptAsync(_chatHubSvc, uDto, [User.Identity.Name]);

            return Ok(uDto);
        }


        [HttpPut("avatar")]
        public async Task<IActionResult> UpdateAvatarAsync([FromForm] UpdateAvatarRequest request)
        {
            var user = await _userManager.FindByIdAsync(User.Identity.Name);

            if (user == null)
                return NotFound();

            var profileDir = Path.Join(
                _hostEnvironment.WebRootPath,
                configuration["ProfileDir"]
                );
            Directory.CreateDirectory(profileDir);
            var file = User.Identity.Name + new FileInfo(request.Avatar.FileName).Extension;

            var fs = new FileStream(Path.Join(profileDir, file), FileMode.OpenOrCreate, FileAccess.Write);
            var stream = request.Avatar.OpenReadStream();
            stream.CopyTo(fs);
            stream.Flush();
            stream.Close();
            stream.Dispose();
            fs.Flush();
            fs.Close();
            fs.Dispose();

            if (!string.IsNullOrEmpty(user.Avatar) && user.Avatar != file)
            {
                var oldAvatar = Path.Join(profileDir, user.Avatar);
                if (System.IO.File.Exists(oldAvatar))
                {
                    System.IO.File.Delete(oldAvatar);
                }
            }

            user.Avatar = file;

            var updateResult = await _userManager.UpdateAsync(user);

            if (!updateResult.Succeeded)
                return BadRequest(updateResult.Errors);

            var uDto = UserDto.FromUser(user, true);

            await _onlineUserSvc.SendToAllUserWithExceptAsync(_chatHubSvc, uDto, [User.Identity.Name]);

            return Ok(uDto);
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

        public bool IsWindows { get; set; }
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
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string CurrentPassword { get; set; } // For password updates
    }

    public class UpdateAvatarRequest
    {
        public IFormFile Avatar { get; set; }
    }
}
