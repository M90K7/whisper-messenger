namespace ChatApp.Models
{
  public class Message
  {
    public int Id { get; set; }
    public int SenderId { get; set; }
    public User Sender { get; set; }
    public int ReceiverId { get; set; }
    public User Receiver { get; set; }
    public string Content { get; set; }
    public string? FilePath { get; set; }

    /// <summary>
    /// null -> save on db
    /// false -> receive
    /// true -> see
    /// </summary>
    /// <value></value>
    public bool? Seen { get; set; }

    public bool Removed { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
  }
}
