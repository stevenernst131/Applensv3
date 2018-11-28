using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using SendGrid.Helpers.Mail;

namespace AppLensV3.Services.EmailNotificationService
{
    public interface IEmailNotificationService
    {

        Task SendEmail1(string alias, string detectorId, string applensLink,List<EmailAddress> tos,string TemplateId, string from);

        Task SendWeeklyMonitoringReport(HttpResponseMessage response);
    }
}
