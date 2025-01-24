using ChatApp.Data;
using ChatApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers.Admin;

[Authorize(Roles = "admin", AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/chat/admin")]
public class AdminChatController : ControllerBase
{
  private readonly AppDbContext _dbContext;

  public AdminChatController(AppDbContext dbContext)
  {
    _dbContext = dbContext;
  }

  [HttpGet]
  public Task<List<Message>> Messages()
  {
    return _dbContext.Messages.Include(m => m.Sender).Include(m => m.Receiver).AsNoTracking().ToListAsync();
  }

  [HttpDelete("{messageId}")]
  public async Task<IActionResult> DeleteMessageAsync([FromRoute] int messageId)
  {
    var rowDelete = await _dbContext.Messages.Where(m => m.Id == messageId).ExecuteDeleteAsync();

    return Ok(new
    {
      delete = rowDelete > 0
    });
  }
}