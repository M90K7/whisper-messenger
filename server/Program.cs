using ChatApp;
using ChatApp.Data;
using ChatApp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using System.Net;


var builder = WebApplication.CreateBuilder(args);


var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);


builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(
        JwtBearerDefaults.AuthenticationScheme,
        x =>
        {
            x.RequireHttpsMetadata = false;
            x.SaveToken = false;
            // options.AutomaticRefreshInterval = options.
            x.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero
            };
            x.Events = new JwtBearerEvents
            {
                OnForbidden = (jwt) =>
                {
                    return Task.CompletedTask;
                },
                OnChallenge = (jwt) =>
                {
                    return Task.CompletedTask;
                },
                OnAuthenticationFailed = (auth) =>
                {
                    return Task.CompletedTask;
                },
            };
        }
    );


// builder.Services
//     .AddAuthentication("Bearer")
//     .AddJwtBearer();
builder.Services.AddAuthorization(
    x =>
    {
        // x.AddPolicy("Bearer", new AuthorizationPolicy(new Authentication()))
    }
);
builder.Services.Configure<JwtSettings>(jwtSettings);


// Add services
builder.Services.AddMvcCore();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services
    .AddSignalR(
        options =>
        {
            options.EnableDetailedErrors = true;
        }
    )
    .AddHubOptions<ChatHub>(
        options =>
        {
            // options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
        }
    )
    .AddJsonProtocol();


builder.Services.AddDbContext<AppDbContext>(
    options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);
builder.Services
    .AddIdentity<User, IdentityRole<int>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();


// Add CORS
builder.Services.AddCors(
    options =>
    {
        options.AddPolicy(
            "AllowAllOrigins",
            policy =>
            {
                policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            }
        );
    }
);


var app = builder.Build();


// Seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var userManager = services.GetRequiredService<UserManager<User>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();

    // Seed roles
    if (!await roleManager.RoleExistsAsync("admin"))
    {
        await roleManager.CreateAsync(new IdentityRole<int> { Name = "admin" });
    }

    // Seed admin user
    if (await userManager.FindByNameAsync("admin") == null)
    {
        var admin = new User
        {
            UserName = "admin",
            Email = "admin@example.com",
            FullName = "Default Admin",
            SecurityStamp = Guid.NewGuid().ToString(),
        };
        await userManager.CreateAsync(admin, "Admin@123");
        await userManager.AddToRoleAsync(admin, "admin");
    }
}


// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors("AllowAllOrigins");


// app.UseHttpsRedirection();


app.UseAuthentication();


app.UseRouting();


app.UseAuthorization();


app.MapControllers();


app.MapFallbackToFile("index.html");


app.MapHub<ChatHub>("/chatHub");


app.Run();
