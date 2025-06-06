
using System.Collections.Concurrent;
using System.IO;
using ChatApp;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.Services;


public class UploadManagerService
{
  protected static readonly ConcurrentDictionary<string, CancellationTokenSource> _files =
      new ConcurrentDictionary<string, CancellationTokenSource>();
  private readonly OnlineUserService _onlineUserSvc;

  public string Folder { get; private set; }

  public UploadManagerService(IConfiguration cfg, IWebHostEnvironment hostEnv, OnlineUserService onlineUserSvc)
  {
    var chatDir = Path.Join(
                hostEnv.WebRootPath,
                cfg["ChatDir"]
                );

    CheckDirectory(chatDir);

    Folder = chatDir;
    _onlineUserSvc = onlineUserSvc;
  }

  public void CheckDirectory(string path)
  {
    if (!Directory.Exists(path))
      Directory.CreateDirectory(path);
  }

  public string NewFileName(IFormFile file)
  {
    var fileName = Guid.NewGuid() + new FileInfo(file.FileName).Extension;
    return Path.Join(Folder, fileName);
  }

  public async Task SaveFile(IHubContext<ChatHub, IChatClient> chatHubSvc, int senderId, IFormFile fileData, CancellationToken token)
  {
    var _1Mb = 1 * 1024 * 1024; // 1MB
                                //#if DEBUG
                                //                    var flushSize = _1Mb;
                                //#else
    var flushSize = 10 * _1Mb; // 10MB Flush to Disk
                               //#endif

    Func<long, FileProgressDto> jsonSignaling = (readSize) => new FileProgressDto
    {
      FileName = fileData.FileName,
      Percent = (int)(readSize / fileData.Length) * 100,
      ReadLength = readSize,
      TotalLength = fileData.Length,
    };

    var fileName = NewFileName(fileData);

    using var stream = fileData.OpenReadStream();
    using var fs = new FileStream(fileName, FileMode.Create, FileAccess.Write, FileShare.None, _1Mb);
    int readBlockSize;
    long totalReadBlock = 0;

    do
    {
      if (token.IsCancellationRequested)
      {
        break;
      }

      byte[] rawBytes = new byte[_1Mb];
      readBlockSize = stream.Read(rawBytes, 0, _1Mb);
      fs.Write(rawBytes, 0, readBlockSize);

      totalReadBlock += readBlockSize;
      if (totalReadBlock % flushSize == 0)
      {
        fs.Flush(true);
      }
      await _onlineUserSvc.SendFileProgress(chatHubSvc, senderId, jsonSignaling(totalReadBlock));
    } while (readBlockSize == _1Mb);

    fs.Flush();
    fs.Close();

    if (token.IsCancellationRequested)
    {
      try
      {
        File.Delete(fileName);
      }
      catch { }
      return;
    }
    await _onlineUserSvc.SendFileProgress(chatHubSvc, senderId, jsonSignaling(fileData.Length));

  }

  public object CancelFile(string id)
  {
    if (_files.TryGetValue(id, out var token))
    {
      token.Cancel();
      return new { serverName = id, isCancel = true };
    }
    else
    {
      return new { serverName = id, isCancel = false };
    }
  }

}