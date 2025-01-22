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
                  Id = -1,
                  FullName = fullName,
                  UserName = username,
                  Email = email,
                  Avatar = profilePath,
                  Role = group,
                  IsWin = true
                });
            }
          }
        }
      }
      return users;
    }

    public UserDto Login(string username, string password)
    {
      try
      {
        var ldapCfg = cfg.GetSection("LDAP");
        // ایجاد یک PrincipalContext برای اتصال به Active Directory
        using (PrincipalContext context = new PrincipalContext(ContextType.Domain, ldapCfg["Domain"]))
        {
          // احراز هویت کاربر
          bool isValid = context.ValidateCredentials(username, password);
          if (isValid)
          {
            Console.WriteLine("احراز هویت موفقیت‌آمیز بود.");

            // دریافت اطلاعات کاربر
            UserPrincipal user = UserPrincipal.FindByIdentity(context, username);

            if (user != null)
            {
              if (user.Enabled.HasValue && user.Enabled.Value)
                return new UserDto
                {
                  UserName = user.SamAccountName,
                  FullName = user.SamAccountName,
                  Email = user.EmailAddress,
                  Role = FindRole(user.GetGroups())
                };
            }
            else
            {
              Console.WriteLine("کاربر یافت نشد.");
            }
          }
          else
          {
            Console.WriteLine("احراز هویت ناموفق بود.");
          }
        }
      }
      catch (Exception ex)
      {
        Console.WriteLine("خطا: " + ex.Message);
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
