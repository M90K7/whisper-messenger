using ChatApp.Data;
using ChatApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<ChatHub, IChatClient> _chatHubSvc;
    private readonly OnlineUserService onlineUserSvc;
    private readonly IConfiguration configuration;
    private readonly IWebHostEnvironment _hostEnvironment;

    public ChatController(
        IConfiguration configuration,
            IWebHostEnvironment hostEnvironment,
        AppDbContext context,
        IHubContext<ChatHub, IChatClient> chatHubSvc,
        OnlineUserService onlineUserSvc
    )
    {
        this.configuration = configuration;
        this._hostEnvironment = hostEnvironment;
        _context = context;
        _chatHubSvc = chatHubSvc;
        this.onlineUserSvc = onlineUserSvc;
    }

    [HttpPost()]
    public async Task<IActionResult> MessageAsync([FromBody] FileMessageRequest message)
    {
        var entry = _context.Messages.Add(new Message
        {
            Content = message.Content,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId
        });
        await _context.SaveChangesAsync();
        var res = await onlineUserSvc.SendMessageAsync(_chatHubSvc, entry.Entity);

        return Ok(new ConfirmDto
        {
            MessageId = entry.Entity.Id,
            ReceiverId = entry.Entity.ReceiverId,
            Timestamp = entry.Entity.Timestamp,
            Seen = res == true ? false : null
        });
    }

    [HttpPost("file")]
    public async Task<IActionResult> FileMessageAsync([FromForm] FileMessageRequest request)
    {
        if (request.File == null)
        {
            return await MessageAsync(request);
        }

        var chatDir = Path.Join(
                _hostEnvironment.WebRootPath,
                configuration["ChatDir"]
                );
        Directory.CreateDirectory(chatDir);
        var file = Guid.NewGuid() + new FileInfo(request.File.FileName).Extension;

        var fs = new FileStream(Path.Join(chatDir, file), FileMode.OpenOrCreate, FileAccess.Write);
        var stream = request.File.OpenReadStream();
        stream.CopyTo(fs);
        stream.Flush();
        stream.Close();
        stream.Dispose();
        fs.Flush();
        fs.Close();
        fs.Dispose();

        var msg = new Message
        {
            Content = request.Content,
            SenderId = request.SenderId,
            ReceiverId = request.ReceiverId
        };
        msg.FilePath = file;
        _context.Messages.Add(msg);
        await _context.SaveChangesAsync();
        var res = await onlineUserSvc.SendMessageAsync(_chatHubSvc, msg);
        return Ok(new ConfirmDto { MessageId = msg.Id, ReceiverId = msg.ReceiverId, FilePath = msg.FilePath, Timestamp = msg.Timestamp });
    }

    [HttpPost("seen")]
    public async Task SeenMessageIdsAsync([FromBody] List<int> messageIds, int senderId)
    {
        var _receiverId = int.Parse(User.Identity.Name);
        _context.Messages.Where(m => messageIds.Contains(m.Id)).ExecuteUpdate(m => m.SetProperty(_m => _m.Seen, true));
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetMessagesAsync(int userId)
    {
        var messages = await _context.Messages
            .AsNoTracking()
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .ToListAsync();
        // .OrderByDescending(m => m.Timestamp);
        return Ok(messages);
    }

    [HttpGet("history/{userId}/{page}")]
    public async Task<IActionResult> GetChatHistory(int userId, int page = 1, int pageSize = 20)
    {
        var currentUserId = int.Parse(User.Identity.Name);
        var messages = await _context.Messages
            .Where(
                m =>
                    (m.SenderId == currentUserId && m.ReceiverId == userId)
                    || (m.SenderId == userId && m.ReceiverId == currentUserId)
            )
            // .OrderByDescending(m => m.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(messages);
    }

    [HttpDelete("{messageId}")]
    public async Task<IActionResult> DeleteMessageAsync(int messageId)
    {
        var _userId = int.Parse(User.Identity.Name);
        var message = await _context.Messages.SingleOrDefaultAsync(m => m.Id == messageId && (m.SenderId == _userId || m.ReceiverId == _userId));
        _context.Messages.Remove(message);
        var rowDelete = await _context.SaveChangesAsync();

        if (rowDelete > 0)
        {
            await onlineUserSvc.DeleteMessageAsync(_chatHubSvc, messageId, _userId == message.SenderId ? message.ReceiverId : message.SenderId);
        }

        return Ok(new
        {
            delete = rowDelete > 0
        });
    }
}

public class MessageRequest
{
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string Content { get; set; }
}

public class FileMessageRequest : MessageRequest
{
    public IFormFile File { get; set; }
}