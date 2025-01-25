using System.Threading.Tasks;
using ChatApp.Data;
using ChatApp.Models;
using ChatApp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers.Admin;

[Authorize(Roles = "admin", AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/Ad")]
public class ActiveDirectoryController : ControllerBase
{
  private readonly AppDbContext _dbContext;
  private readonly ActiveDirectoryService adSvc;

  public ActiveDirectoryController(AppDbContext dbContext, ActiveDirectoryService adSvc)
  {
    _dbContext = dbContext;
    this.adSvc = adSvc;
  }

  [HttpGet]
  public async Task<IActionResult> GetAsync()
  {
    var ad = await _dbContext.ActiveDirectories.AsNoTracking().FirstOrDefaultAsync();

    if (ad == null)
      return Ok(new { });

    return Ok(ad);
  }

  [HttpPost]
  public async Task<IActionResult> StoreAsync([FromBody] ActiveDirectory adModel)
  {

    var userDto = TestUser(adModel);
    if (userDto is NotFoundResult)
    {
      return userDto;
    }

    var ad = await _dbContext.ActiveDirectories.FirstOrDefaultAsync();
    if (ad == null)
    {
      ad = new ActiveDirectory();
      _dbContext.ActiveDirectories.Add(ad);
    }

    ad.Url = adModel.Url;
    ad.Name = adModel.Name;
    ad.Username = adModel.Username;
    ad.Password = adModel.Password;

    _ = await _dbContext.SaveChangesAsync();

    return Ok(adModel);

  }

  [HttpPost("test")]
  public ActionResult TestUser([FromBody] ActiveDirectory adModel)
  {
    var userDto = adSvc.Login(adModel.Username, adModel.Password, adModel.Name, adModel.Url);

    return userDto == null ? NotFound() : Ok();
  }
}