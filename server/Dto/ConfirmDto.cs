public class ConfirmDto
{
  public int MessageId { get; set; }
  public int ReceiverId { get; set; }
  public string FilePath { get; set; }
  public bool? Seen { get; set; }
  public DateTime Timestamp { get; set; } = DateTime.UtcNow;

}