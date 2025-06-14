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
using ChatApp.Services;


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
            x.SaveToken = true;
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
                OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            // Check if the request is for SignalR
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/io/chat")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        },
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
builder.Services.AddSingleton<OnlineUserService>();
builder.Services.AddScoped<UploadManagerService>();


// Add services
builder.Services.AddMvc();
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
        x =>
        {

            // options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
        }
    )
    .AddJsonProtocol()
    ;


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

    if (!await roleManager.RoleExistsAsync("operator"))
    {
        await roleManager.CreateAsync(new IdentityRole<int> { Name = "operator" });
    }

    if (!await roleManager.RoleExistsAsync("viewer"))
    {
        await roleManager.CreateAsync(new IdentityRole<int> { Name = "viewer" });
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

app.UseStaticFiles();


app.UseAuthentication();


app.UseRouting();


app.UseAuthorization();


app.MapControllers();


app.MapFallbackToFile("index.html");


app.MapHub<ChatHub>("io/chat").RequireAuthorization(x =>
{
    x.AuthenticationSchemes = new[] { JwtBearerDefaults.AuthenticationScheme };
    x.RequireRole("admin", "operator");
});


app.Run();
