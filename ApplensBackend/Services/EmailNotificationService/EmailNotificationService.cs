using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
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

        public async Task SendEmail1(string alias, string detectorId, string link, List<EmailAddress> tos, string TemplateId = "d-436ddef95ff144f28d665e7faaf01a2f", string from = "applensv2team@microsoft.com")
        {
            var client = new SendGridClient(SendGridApiKey);
            var fromAddress = new EmailAddress(from, "Applens Notification");
            //var plainTextContent = "and easy to do anywhere, even with C#";
            //var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
            var msg = new SendGridMessage();
            msg.SetFrom(fromAddress);
            msg.AddTos(tos);
            msg.SetTemplateId("d-436ddef95ff144f28d665e7faaf01a2f");
            
            var dynamicTemplateData = new ExampleTemplateData
            {
                detectorId = detectorId,
                alias = alias,
                c2a_link = link
            };

            msg.SetTemplateData(dynamicTemplateData);
            var response = await client.SendEmailAsync(msg);
            Console.WriteLine(response.StatusCode);
            Console.WriteLine(response.Headers.ToString());
            Console.WriteLine("\n\nPress any key to exit.");
        }

        private class ExampleTemplateData
        {
            [JsonProperty("detectorId")]
            public string detectorId { get; set; }

            [JsonProperty("alias")]
            public string alias { get; set; }

            [JsonProperty("c2a_link")]
            public string c2a_link { get; set; }
        }

        private class Location
        {
            [JsonProperty("city")]
            public string City { get; set; }

            [JsonProperty("country")]
            public string Country { get; set; }
        }
    }


}
