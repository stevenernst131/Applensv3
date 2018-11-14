using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace AppLensV3.Services.EmailNotificationService
{
    public class EmailNotificationService: IEmailNotificationService
    {
        private IConfiguration _configuration;

        private HttpClient _client { get; set; }

        public string SendGridApiKey
        {
            get
            {
                return _configuration["EmailNotification:ApiKey"];
            }
        }

        public EmailNotificationService(IConfiguration configuration)
        {
            _configuration = configuration;
            _client = InitializeClient();
        }

        private HttpClient InitializeClient()
        {
            var handler = new HttpClientHandler();

            var client = new HttpClient(handler)
            {
                BaseAddress = new Uri("https://api.sendgrid.com/v3/mail/send"),
                Timeout = TimeSpan.FromSeconds(5 * 60),
                MaxResponseContentBufferSize = Int32.MaxValue
            };

            //client.DefaultRequestHeaders.Add("content-type", "application/json");
            //client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return client;
        }

        public async Task<HttpResponseMessage> SendEmail(string method, string path, string body = null, bool internalView = true)
        {

            HttpResponseMessage response = null;
            HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, "api/invoke");
            requestMessage.Headers.Add("content-type", "application/json");
            
            return response;

        }

        public async Task SendEmail1(string from, string to, string subject, IDictionary<string, string> replacement, string TemplateId)
        {
            var client = new SendGridClient(SendGridApiKey);
            var from = new EmailAddress(from);
            var to = new EmailAddress(to);
            var plainTextContent = "and easy to do anywhere, even with C#";
            var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);



            var mail = new SendGridMessage
            {
                From = new EmailAddress(from)
            };

            mail.AddTo(to);
            mail.Subject = subject;

            // NOTE: Text/Html and EnableTemplate HTML are not really used if a TemplateId is specified
            mail.Text = string.Empty;
            mail.Html = "<p></p>";
            mail.EnableTemplate("<%body%>");

            mail.EnableTemplateEngine(templateId);

            // Add each replacement token
            foreach (var key in replacementTokens.Keys)
            {
                mail.AddSubstitution(
                  key,
                  new List<string>
                    {
          replacementTokens[key]
                    });
            }

            var transportWeb = new Web("THE_AUTH_KEY");
            var result = transportWeb.DeliverAsync(mail);

        }
    }
}
