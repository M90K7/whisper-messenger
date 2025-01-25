using System.Threading.Tasks;
using ChatApp.Data;
using ChatApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers.Admin;

[Authorize(Roles = "admin", AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/apps")]
public class AppController : ControllerBase
{
  private readonly IConfiguration configuration;
  private readonly IWebHostEnvironment hostEnvironment;
  private readonly AppDbContext dbContext;

  public AppController(
  IConfiguration configuration,
  IWebHostEnvironment hostEnvironment,
  AppDbContext context)
  {
    this.configuration = configuration;
    this.hostEnvironment = hostEnvironment;
    this.dbContext = context;
  }

  [AllowAnonymous]
  [HttpGet]
  public async Task<IActionResult> GetAsync()
  {
    var setting = await GetAppSettingAsync();

    return Ok(setting);
  }

  [HttpPost("icon")]
  public async Task<IActionResult> FileIconAsync([FromForm] FileMessageRequest request, string fileName)
  {

    var bg = FileAsync(request, "logo");

    var setting = await GetAppSettingAsync();

    setting.Icon = bg.FileName;

    _ = await dbContext.SaveChangesAsync();

    return Ok(bg);
  }

  [HttpPost("bg")]
  public async Task<IActionResult> FileBgAsync([FromForm] FileMessageRequest request, string fileName)
  {
    var bg = FileAsync(request, "bg");

    var setting = await GetAppSettingAsync();

    setting.background = bg.FileName;

    _ = await dbContext.SaveChangesAsync();

    return Ok(bg);
  }

  [HttpPut]
  public async Task<IActionResult> UpdateAsync([FromBody] AppSetting appSetting)
  {
    var dbSetting = await GetAppSettingAsync();

    dbSetting.MaxAvatarSize = appSetting.MaxAvatarSize;
    dbSetting.MaxFileUploadSize = appSetting.MaxFileUploadSize;
    dbSetting.ShortTitle = appSetting.ShortTitle;
    dbSetting.Title = appSetting.Title;

    _ = await dbContext.SaveChangesAsync();

    return Ok(dbSetting);
  }

  private AppSettingDto FileAsync([FromForm] FileMessageRequest request, string fileName)
  {

    var appsDir = Path.Join(
            hostEnvironment.WebRootPath,
            configuration["AppDir"]
            );
    if (!Directory.Exists(appsDir))
      Directory.CreateDirectory(appsDir);
    var file = fileName + new FileInfo(request.File.FileName).Extension;

    var fs = new FileStream(Path.Join(appsDir, file), FileMode.OpenOrCreate, FileAccess.Write);
    var stream = request.File.OpenReadStream();
    stream.CopyTo(fs);
    stream.Flush();
    stream.Close();
    stream.Dispose();
    fs.Flush();
    fs.Close();
    fs.Dispose();

    return new AppSettingDto { FileName = file, Url = configuration["AppDir"] + "/" + fileName };
  }

  private async Task<AppSetting> GetAppSettingAsync()
  {
    var setting = await dbContext.AppSettings.FirstOrDefaultAsync();

    if (setting == null)
    {
      setting = new AppSetting();
      dbContext.AppSettings.Add(setting);
    }
    return setting;
  }

}
public class FileAppRequest
{
  public IFormFile File { get; set; }
}

public class AppSettingDto
{
  public string Url { get; set; }
  public string FileName { get; set; }
}

