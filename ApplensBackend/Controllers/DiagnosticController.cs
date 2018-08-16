using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;

namespace AppLensV3.Controllers
{
    [Route("api")]
    [Authorize]
    public class DiagnosticController : Controller
    {
        IDiagnosticClientService _diagnosticClient;

        public DiagnosticController(IDiagnosticClientService diagnosticClient)
        {
            this._diagnosticClient = diagnosticClient;
        }

        [HttpPost("invoke")]
        [HttpOptions("invoke")]
        public async Task<IActionResult> Invoke([FromBody]JToken body)
        {
            if (!Request.Headers.ContainsKey("x-ms-path-query"))
            {
                return BadRequest("Missing x-ms-path-query header");
            }

            string path = Request.Headers["x-ms-path-query"];

            string method = HttpMethod.Get.Method;
            if (Request.Headers.ContainsKey("x-ms-method"))
            {
                method = Request.Headers["x-ms-method"];
            }

            var response = await this._diagnosticClient.Execute(method, path, body?.ToString());

            if (response != null && response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();

                var responseObject = JsonConvert.DeserializeObject(responseString);
                return Ok(responseObject);
            }

            return StatusCode((int)response.StatusCode);
        }
    }
}
