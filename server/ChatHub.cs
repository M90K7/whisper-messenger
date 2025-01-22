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
        Task SendSeenMessagesAsync(List<int> messageIds);
        Task DeleteMessageAsync(Message msg);
        Task SendUserAsync(UserDto msg);

        Task SendConfirmAsync(ConfirmDto confirm);

        Task SendFileProgress(FileProgressDto dto);
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

            await base.OnConnectedAsync();

            await this.Clients.AllExcept(Context.ConnectionId).SendUserAsync(UserDto.FromUser(user, true));

        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                _onlineUserSvc.RemoveUser(userId);
                var user = await _userManager.FindByIdAsync(userId);

                await Clients.AllExcept(Context.ConnectionId).SendUserAsync(UserDto.FromUser(user, false));
            }
            else if (!string.IsNullOrEmpty(Context.ConnectionId))
                _onlineUserSvc.RemoveWithConnectionId(Context.ConnectionId);

            await base.OnDisconnectedAsync(exception);
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

    public void RemoveWithConnectionId(string connectionId)
    {
        foreach (var item in _onlineUsers)
        {
            if (item.Value == connectionId)
            {
                var key = item.Key;
                RemoveUser(key);
                break;
            }
        }
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
        try
        {
            var conId = GetConnectionId(message.ReceiverId.ToString());
            if (conId != null)
            {
                await hub.Clients.Client(conId).SendMessageAsync(message);
                return true;
            }
            return false;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> DeleteMessageAsync(IHubContext<ChatHub, IChatClient> hub, int messageId, int receiverId)
    {
        var conId = GetConnectionId(receiverId.ToString());
        if (conId != null)
        {
            await hub.Clients.Client(conId).DeleteMessageAsync(new Message { Id = messageId });
            return true;
        }
        return false;
    }

    public async Task SendToAllUserAsync(IHubContext<ChatHub, IChatClient> hub, UserDto user)
    {
        await hub.Clients.All.SendUserAsync(user);
    }

    public async Task SendToAllUserWithExceptAsync(IHubContext<ChatHub, IChatClient> hub, UserDto user, string[] userIds)
    {
        List<string> exceptIds = [];
        foreach (var uId in userIds)
        {
            var id = GetConnectionId(uId.ToString());
            if (!string.IsNullOrEmpty(id))
            {
                exceptIds.Add(id);
            }

        }
        if (exceptIds.Any())
            await hub.Clients.AllExcept(exceptIds).SendUserAsync(user);
        else
            await SendToAllUserAsync(hub, user);
    }

    public async Task SendSeenMessageIds(IHubContext<ChatHub, IChatClient> hub, int senderId, List<int> messageIds)
    {
        try
        {
            var conId = GetConnectionId(senderId.ToString());
            if (conId != null)
            {
                await hub.Clients.Client(conId).SendSeenMessagesAsync(messageIds);
            }
        }
        catch (Exception)
        {
        }
    }

    public async Task SendFileProgress(IHubContext<ChatHub, IChatClient> hub, int senderId, FileProgressDto dto)
    {
        try
        {
            var conId = GetConnectionId(senderId.ToString());
            if (conId != null)
            {
                await hub.Clients.Client(conId).SendFileProgress(dto);
            }
        }
        catch (Exception)
        {
        }
    }

}
