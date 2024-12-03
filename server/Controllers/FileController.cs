using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class FileController : ControllerBase
  {
    private readonly IWebHostEnvironment _environment;

    public FileController(IWebHostEnvironment environment)
    {
      _environment = environment;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
      if (file.Length > 0)
      {
        var filePath = Path.Combine(_environment.WebRootPath, "uploads", file.FileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return Ok(new { FilePath = filePath });
      }
      return BadRequest("Invalid file");
    }
  }
}
