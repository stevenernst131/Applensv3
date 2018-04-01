using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace AppLensV3.Controllers
{
    [Route("api")]
    public class DiagnosticController : Controller
    {
        IDiagnosticClientService _diagnosticClient;

        public DiagnosticController(IDiagnosticClientService diagnosticClient) {
            this._diagnosticClient = diagnosticClient;
        }

        [HttpGet("invoke")]
        [HttpOptions("invoke")]
        public async Task<IActionResult> Invoke()
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

            string body = string.Empty;
            if (Request.Headers.ContainsKey("x-ms-body"))
            {
                body = Request.Headers["x-ms-body"];
            }

            var response = await this._diagnosticClient.Execute(method, path, body);
            return Ok(response);
        }
    }
}
