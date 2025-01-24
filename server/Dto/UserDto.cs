

using ChatApp.Models;

public class UserDto
{
  public int Id { get; set; }
  public string UserName { get; set; }
  public string Email { get; set; }
  public string FullName { get; set; }
  public string Role { get; set; }
  public string Avatar { get; set; }
  public int UptimeMinutes { get; set; }

  public bool Online { get; set; }

  public bool IsWindows { get; set; }

  public static UserDto FromUser(User user, string role)
  {
    return new UserDto
    {
      Id = user.Id,
      UserName = user.UserName,
      Email = user.Email,
      Avatar = user.Avatar,
      UptimeMinutes = user.UptimeMinutes,
      FullName = user.FullName,
      Role = role,
    };
  }

  public static UserDto FromUser(User user, bool online)
  {
    return new UserDto
    {
      Id = user.Id,
      UserName = user.UserName,
      Email = user.Email,
      Avatar = user.Avatar,
      UptimeMinutes = user.UptimeMinutes,
      FullName = user.FullName,
      Online = online,
    };
  }
}


public class FileProgressDto
{
  public string FileName { get; set; }

  public long TotalLength { get; set; }

  public int Percent { get; set; }
  public long ReadLength { get; set; }
}