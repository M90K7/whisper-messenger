using ChatApp.Data;
using ChatApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers
{
  [Authorize]
  [ApiController]
  [Route("api/[controller]")]
  public class ChatController : ControllerBase
  {
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
      _context = context;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] Message message)
    {
      _context.Messages.Add(message);
      await _context.SaveChangesAsync();
      return Ok(message);
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetMessages(int userId)
    {
      var messages = _context.Messages
          .Where(m => m.SenderId == userId || m.ReceiverId == userId)
          .OrderByDescending(m => m.Timestamp);
      return Ok(messages);
    }

    [HttpGet("history/{userId}")]
    public async Task<IActionResult> GetChatHistory(int userId)
    {
      var currentUserId = int.Parse(User.Identity.Name);

      var messages = await _context.Messages
          .Where(m => (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                      (m.SenderId == userId && m.ReceiverId == currentUserId))
          .OrderBy(m => m.Timestamp)
          .ToListAsync();

      return Ok(messages);
    }
  }
}
