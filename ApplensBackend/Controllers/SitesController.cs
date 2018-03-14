using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AppLensV3
{
    public class SitesController : Controller
    {
        IObserverClientService _observerService;

        public SitesController(IObserverClientService observerService) {
            _observerService = observerService;
        }

        [HttpGet("api/sites/{siteName}")]
        [HttpOptions("api/sites/{siteName}")]
        public async Task<IActionResult> GetSite(string siteName)
        {
            return await GetSiteInternal(null, siteName);
        }

        [HttpGet]
        [Route("api/stamps/{stamp}/sites/{siteName}")]
        public async Task<IActionResult> GetSite(string stamp, string siteName)
        {
            return await GetSiteInternal(stamp, siteName);
        }

        [HttpGet("api/hostingEnvironments/{hostingEnvironmentName}")]
        [HttpOptions("api/hostingEnvironments/{hostingEnvironmentName}")]
        public async Task<IActionResult> GetHostingEnvironmentDetails(string hostingEnvironmentName)
        {
            var hostingEnvironmentDetails = await _observerService.GetHostingEnvironmentDetails(hostingEnvironmentName);

            if (hostingEnvironmentDetails.StatusCode != HttpStatusCode.OK)
            {
                //return ResponseMessage(Request.CreateErrorResponse(hostingEnvironmentDetails.StatusCode, (string)hostingEnvironmentDetails.Content));
            }

            return Ok(new { Details = hostingEnvironmentDetails.Content });
        }

        private async Task<IActionResult> GetSiteInternal(string stamp, string siteName)
        {
            var hostnamesTask = _observerService.GetHostnames(siteName);
            var siteDetailsTask = stamp == null ? _observerService.GetSite(siteName) : _observerService.GetSite(stamp, siteName);

            var hostNameResponse = await hostnamesTask;
            var siteDetailsResponse = await siteDetailsTask;

            if (siteDetailsResponse.StatusCode != HttpStatusCode.OK)
            {
                //return ResponseMessage(Request.CreateErrorResponse(siteDetailsResponse.StatusCode, (string)siteDetailsResponse.Content));
            }

            if (hostNameResponse.StatusCode != HttpStatusCode.OK)
            {
                //return ResponseMessage(Request.CreateErrorResponse(hostNameResponse.StatusCode, (string)hostNameResponse.Content));
            }

            return Ok(new
            {
                SiteName = siteName,
                Details = siteDetailsResponse.Content,
                HostNames = hostNameResponse.Content
            });
        }
    }
}
