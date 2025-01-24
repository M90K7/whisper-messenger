using System.Linq;
using System.DirectoryServices;
using ChatApp.Models;
using System.DirectoryServices.AccountManagement;

namespace ChatApp.Services
{
  public class ActiveDirectoryService
  {
    private readonly IConfiguration cfg;

    public ActiveDirectoryService(IConfiguration cfg)
    {
      this.cfg = cfg;
    }

    public List<UserDto> GetUsers()
    {
      var users = new List<UserDto>();

      var ldapCfg = cfg.GetSection("LDAP");

      using (var entry = new DirectoryEntry($"LDAP://{ldapCfg["Domain"]}", ldapCfg["User"], ldapCfg["Password"]))
      {
        using (var searcher = new DirectorySearcher(entry))
        {
          // (&(objectClass=user)(objectCategory=person))
          searcher.Filter = "(&(objectClass=user)(objectCategory=person))";  // "(objectCategory=person)";
          searcher.PropertiesToLoad.Add("samaccountname");
          searcher.PropertiesToLoad.Add("displayname");
          searcher.PropertiesToLoad.Add("memberOf");
          searcher.PropertiesToLoad.Add("mail");
          searcher.PropertiesToLoad.Add("profilePath");

          foreach (SearchResult result in searcher.FindAll())
          {
            if (result.Properties.Contains("samaccountname"))
            {
              string username = result.Properties["samaccountname"][0].ToString();
              string fullName = FindFirstOrDefault(result.Properties["displayname"]);
              var group = FindRole(result.Properties["memberOf"]);
              string email = FindFirstOrDefault(result.Properties["mail"]);
              string profilePath = FindFirstOrDefault(result.Properties["profilePath"]);

              if (group != null)
              {
                group = ExtractCNFromDN(group);
              }

              if (fullName != null)
                users.Add(new UserDto
                {
                  Id = 0,
                  FullName = fullName,
                  UserName = username,
                  Email = email,
                  Avatar = profilePath,
                  Role = group,
                  IsWindows = true
                });
            }
          }
        }
      }
      return users;
    }

    public UserDto Login(string user, string password)
    {
      try
      {
        var ldapCfg = cfg.GetSection("LDAP");

        using (var entry = new DirectoryEntry($"LDAP://{ldapCfg["Domain"]}", "ROOT\\" + user, password))
        {
          using (var searcher = new DirectorySearcher(entry))
          {
            // (&(objectClass=user)(objectCategory=person))
            // searcher.Filter = "(&(objectClass=user)(objectCategory=person))";  // "(objectCategory=person)";
            searcher.Filter = "(sAMAccountName=" + user + ")";
            searcher.PropertiesToLoad.Add("samaccountname");
            searcher.PropertiesToLoad.Add("displayname");
            searcher.PropertiesToLoad.Add("memberOf");
            searcher.PropertiesToLoad.Add("mail");
            searcher.PropertiesToLoad.Add("profilePath");

            //foreach (SearchResult result in searcher.FindOne())
            SearchResult result = searcher.FindOne();
            if (result != null)
            {
              if (result.Properties.Contains("samaccountname"))
              {
                string username = result.Properties["samaccountname"][0].ToString();
                string fullName = FindFirstOrDefault(result.Properties["displayname"]);
                var group = FindRole(result.Properties["memberOf"]);
                string email = FindFirstOrDefault(result.Properties["mail"]);
                string profilePath = FindFirstOrDefault(result.Properties["profilePath"]);

                if (group != null)
                {
                  group = ExtractCNFromDN(group);
                }

                if (fullName != null)
                  return new UserDto
                  {
                    Id = 0,
                    FullName = fullName,
                    UserName = username,
                    Email = email,
                    Avatar = profilePath,
                    Role = group,
                    IsWindows = true
                  };
              }
            }
          }
        }
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex.Message);
      }
      return null;
    }

    public string FindFirstOrDefault(ResultPropertyValueCollection collection)
    {
      return collection.Count > 0 ? collection[0].ToString() : null;
    }

    string FindRole(ResultPropertyValueCollection collection)
    {
      foreach (var item in collection)
      {
        var role = ExtractCNFromDN(item.ToString());
        if (role.StartsWith("Admin"))
        {
          return "admin";
        }
      }
      return "operator";
    }

    string FindRole(PrincipalSearchResult<Principal> collection)
    {
      foreach (var item in collection)
      {
        var role = ExtractCNFromDN(item.Name.ToString());
        if (role.StartsWith("Admin"))
        {
          return "admin";
        }
      }
      return "operator";
    }

    string ExtractCNFromDN(string dn)
    {
      // پیدا کردن بخش CN از DN
      int cnStart = dn.IndexOf("CN=", StringComparison.OrdinalIgnoreCase);
      if (cnStart < 0)
        return dn; // اگر CN پیدا نشد، کل DN برگردانده شود

      // جدا کردن بخش CN
      int cnEnd = dn.IndexOf(',', cnStart);
      if (cnEnd < 0)
        cnEnd = dn.Length;

      // استخراج و برگرداندن CN
      string cn = dn.Substring(cnStart, cnEnd - cnStart).Replace("CN=", "");
      return cn;
    }
  }
}
