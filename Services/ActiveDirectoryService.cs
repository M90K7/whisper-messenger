using System.DirectoryServices;

namespace ChatApp.Services
{
  public class ActiveDirectoryService
  {
    public List<string> GetUsers(string domain)
    {
      var users = new List<string>();
      using (var entry = new DirectoryEntry($"LDAP://{domain}"))
      {
        using (var searcher = new DirectorySearcher(entry))
        {
          searcher.Filter = "(objectCategory=person)";
          searcher.PropertiesToLoad.Add("samaccountname");
          searcher.PropertiesToLoad.Add("displayname");

          foreach (SearchResult result in searcher.FindAll())
          {
            if (result.Properties.Contains("samaccountname"))
            {
              users.Add(result.Properties["samaccountname"][0].ToString());
            }
          }
        }
      }
      return users;
    }
  }
}
