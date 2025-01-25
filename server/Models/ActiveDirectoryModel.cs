
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Models;

public class ActiveDirectory
{
  public int Id { get; set; }
  public string Url { get; set; }
  public string Name { get; set; }
  public string Username { get; set; }
  public string Password { get; set; }

}