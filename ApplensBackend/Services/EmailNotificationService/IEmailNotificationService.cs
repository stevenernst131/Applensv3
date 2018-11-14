using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace AppLensV3.Services.EmailNotificationService
{
    public interface IEmailNotificationService
    {
        Task<HttpResponseMessage> SendEmail(string method, string path, string body = null, bool internalView = true);
    }
}
