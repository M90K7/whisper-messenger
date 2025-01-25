namespace ChatApp.Models
{
  public class AppSetting
  {
    public int Id { get; set; }

    public string ShortTitle { get; set; }
    public string Title { get; set; }
    public string Icon { get; set; }
    public string background { get; set; }
    public int MaxAvatarSize { get; set; } = 5;
    public int MaxFileUploadSize { get; set; } = 20;
  }
}
