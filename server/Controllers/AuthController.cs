using ChatApp.Models;
using ChatApp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace ChatApp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly ActiveDirectoryService _adSvc;
        private readonly JwtSettings _jwtSettings;

        public AuthController(
            UserManager<User> userManager,
            RoleManager<IdentityRole<int>> roleManager,
            IOptions<JwtSettings> jwtSettings,
            ActiveDirectoryService AdSvc
        )
        {
            _userManager = userManager;
            this._roleManager = roleManager;
            _adSvc = AdSvc;
            _jwtSettings = jwtSettings.Value;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userManager.FindByNameAsync(request.Username);
            if (user != null)
            {

                if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
                {
                    return Unauthorized("Invalid username or password.");
                }
            }
            else
            {
                user = _adSvc.Login(request.Username, request.Password);
            }

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token, ExpiresInMinutes = user.UptimeMinutes });
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshAsync()
        {
            var user = await _userManager.FindByIdAsync(User.Identity.Name);
            var token = GenerateJwtToken(user);
            return Ok(new { Token = token, ExpiresInMinutes = user.UptimeMinutes });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.GivenName, user.FullName ?? ""),
                new Claim(JwtRegisteredClaimNames.Name, user.UserName ?? ""),
                new Claim("role", string.Join(",", _userManager.GetRolesAsync(user).Result.ToArray())),
                new Claim(ClaimTypes.Name, user.Id.ToString()),
                // new Claim(ClaimTypes.Email, user.Email),
                new Claim(
                    ClaimTypes.Role,
                    string.Join(",", _userManager.GetRolesAsync(user).Result.ToArray())
                ),
                // new Claim(ClaimTypes.GivenName, user.FullName ?? ""),
                new Claim("avatar", user.Avatar ?? ""),
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(user.UptimeMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
