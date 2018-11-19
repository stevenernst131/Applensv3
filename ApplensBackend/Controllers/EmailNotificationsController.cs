using AppLensV3.Helpers;
using AppLensV3.Models;
using AppLensV3.Services;
using AppLensV3.Services.EmailNotificationService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppLensV3.Controllers
{
    [Route("api")]
    [Authorize]
    public class EmailNotificationsController : Controller
    {
        private readonly IEmailNotificationService _emailService;

        public EmailNotificationsController(IEmailNotificationService emailService)
        {
            this._emailService = emailService;
        }

        [HttpGet("email")]
        [HttpOptions("email")]
        public async Task<IActionResult> Invoke(string subscriptionId, string startTime = null, string endTime = null, string impactedServices = null)
        {
  
            if (string.IsNullOrWhiteSpace(subscriptionId))
            {
                return BadRequest("subscriptionId cannot be empty");
            }

            if (!DateTimeHelper.PrepareStartEndTimeWithTimeGrain(startTime, endTime, string.Empty, 30, out DateTime startTimeUtc, out DateTime endTimeUtc, out TimeSpan timeGrainTimeSpan, out string errorMessage))
            {
                return BadRequest(errorMessage);
            }


         //   List<Communication> comms = await this._emailService.SendEmail(subscriptionId, "", "");
            return Ok();
        }
    }
}
