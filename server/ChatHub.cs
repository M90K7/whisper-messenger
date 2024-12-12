using System.Collections.Concurrent;
using ChatApp;
using ChatApp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp
{
  public interface IChatClient
  {
    Task SendMessageAsync(Message msg);
    Task SendUserAsync(UserDto msg);

    Task SendConfirmAsync(ConfirmDto confirm);
  }

  public class ChatHub : Hub<IChatClient>
  {

    private readonly OnlineUserService _onlineUserSvc;
    private readonly UserManager<User> _userManager;

    public ChatHub(OnlineUserService onlineUserSvc, UserManager<User> userManager)
    {
      _onlineUserSvc = onlineUserSvc;
      _userManager = userManager;
    }

    public override async Task OnConnectedAsync()
    {

      var userId = Context.UserIdentifier; // User's unique identifier
      if (userId != null)
      {
        _onlineUserSvc.AddUser(userId, Context.ConnectionId);
      }
      var user = await _userManager.FindByIdAsync(userId);

      await Clients.All.SendUserAsync(UserDto.FromUser(user, true));

      await base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
      var userId = Context.UserIdentifier;
      if (userId != null)
      {
        _onlineUserSvc.RemoveUser(userId);
      }
      // Clients.All.SendAsync("UserDisconnected", userId);
      return base.OnDisconnectedAsync(exception);
    }
  }
}

public class OnlineUserService
{
  private static readonly ConcurrentDictionary<string, string> _onlineUsers = new();

  public void AddUser(string userId, string connectionId)
  {
    _onlineUsers[userId] = connectionId;
  }

  public void RemoveUser(string userId)
  {
    _onlineUsers.TryRemove(userId, out _);
  }

  public string GetConnectionId(string userId)
  {
    _onlineUsers.TryGetValue(userId, out var connectionId);
    return connectionId;
  }

  public bool IsOnlineUser(string userId)
  {
    return !string.IsNullOrEmpty(GetConnectionId(userId));
  }

  public async Task<bool> SendMessageAsync(IHubContext<ChatHub, IChatClient> hub, Message message)
  {
    var conId = GetConnectionId(message.ReceiverId.ToString());
    if (conId != null)
    {
      await hub.Clients.Client(conId).SendMessageAsync(message);
      return true;
    }
    return false;
  }
}
