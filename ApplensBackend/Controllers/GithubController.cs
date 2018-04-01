using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AppLensV3.Helpers;
using AppLensV3.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AppLensV3.Controllers
{
    [Produces("application/json")]
    [Route("api/github")]
    public class GithubController : Controller
    {
        private IGithubClientService _githubService;

        public GithubController(IGithubClientService githubService)
        {
            _githubService = githubService;
        }

        [HttpGet("detectortemplate")]
        public async Task<IActionResult> GetTemplate()
        {
                string content = await _githubService.GetFileContent(GithubConstants.DetectorTemplatePath);
                return Ok(content);
        }

        [HttpGet("detectors/{id}")]
        public async Task<IActionResult> GetDetectorFile(string id)
        {
            string url = string.Format(GithubConstants.DetectorFilePathFormat, id, "Access_Token");
            GithubEntry githubEntry = await _githubService.Get(url);
            string content = await _githubService.GetFileContent(githubEntry.Download_url);
            
            return Ok(content);
        }

        [HttpPost("publishdetector")]
        public async Task<IActionResult> PublishPackage([FromBody]Package pkg)
        {
            if(pkg == null || string.IsNullOrWhiteSpace(pkg.Id) || string.IsNullOrWhiteSpace(pkg.DllBytes))
            {
                return BadRequest();
            }

            await _githubService.Publish(pkg);
            return Accepted();
        }
    }
}