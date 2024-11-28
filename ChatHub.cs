using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp
{
  public class ChatHub : Hub
  {
    private static readonly ConcurrentDictionary<string, string> OnlineUsers = new();

    public override Task OnConnectedAsync()
    {
      var userId = Context.UserIdentifier; // User's unique identifier
      if (userId != null)
      {
        OnlineUsers[userId] = Context.ConnectionId;
      }
      Clients.All.SendAsync("UserConnected", userId);
      return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
      var userId = Context.UserIdentifier;
      if (userId != null)
      {
        OnlineUsers.TryRemove(userId, out _);
      }
      Clients.All.SendAsync("UserDisconnected", userId);
      return base.OnDisconnectedAsync(exception);
    }

    public static List<string> GetOnlineUsers()
    {
      return OnlineUsers.Keys.ToList();
    }

    public async Task SendMessage(string senderId, string receiverId, string message)
    {
      // Notify the receiver of a new message
      if (OnlineUsers.TryGetValue(receiverId, out var connectionId))
      {
        await Clients.Client(connectionId).SendAsync("ReceiveMessage", senderId, message);
      }

      // Notify the sender for confirmation
      await Clients.Caller.SendAsync("MessageSent", message);
    }
  }
}
