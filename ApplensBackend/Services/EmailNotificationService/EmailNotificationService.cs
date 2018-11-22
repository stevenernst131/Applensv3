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
using System.Data;

namespace AppLensV3.Services.EmailNotificationService
{
    public class EmailNotificationService: IEmailNotificationService
    {
        private IConfiguration _configuration;
        private IKustoQueryService _kustoQueryService;

        private TimeSpan _weeklyWindow = TimeSpan.FromDays(7);

        private string _monitoringSummaryQuery = @"
        union withsource = SourceTable 
                    (cluster('wawscus').database('wawsprod').DiagnosticRole | where TIMESTAMP >= ago({timeRange})), 
                    (cluster('wawseus').database('wawsprod').DiagnosticRole | where TIMESTAMP >= ago({timeRange})), 
                    (cluster('wawseas').database('wawsprod').DiagnosticRole | where TIMESTAMP >= ago({timeRange})), 
                    (cluster('wawsneu').database('wawsprod').DiagnosticRole | where TIMESTAMP >= ago({timeRange}))
        | where EventId == '2002'
        | where Address contains strcat('/detectors/', '{detectorId}') and  Address !contains strcat('/detectors/', '{detectorId}', '/statistics')
        | summarize totalReqs = count(), failedReqs = countif(StatusCode>=500), avgLatency = avg(LatencyInMilliseconds), p90Latency = percentiles(LatencyInMilliseconds, 90)
        | extend availability = 100.0 - (failedReqs*100.0/totalReqs)
        ";

        private HttpClient _client { get; set; }

        public string SendGridApiKey
        {
            get
            {
                return _configuration["EmailNotification:ApiKey"];
            }
        }

        public EmailNotificationService(IConfiguration configuration, IKustoQueryService kustoQueryService)
        {
            _configuration = configuration;
            _kustoQueryService = kustoQueryService;
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

        public async Task<Dictionary<string, string>> GetMonitoringMetricsAsync(string subscription, string detectorId, DateTime startTime, DateTime endTime, string impactedService = "appservice", string timeRange = "7d")
        {
            if (string.IsNullOrWhiteSpace(subscription))
            {
                throw new ArgumentNullException("subscription");
            }

            if (string.IsNullOrWhiteSpace(detectorId))
            {
                throw new ArgumentNullException("detectorId");
            }

            DateTime currentTimeUTC = DateTime.UtcNow;

            string monitoringSummaryQuery = _monitoringSummaryQuery
                .Replace("{timeRange}", timeRange)
                .Replace("{detectorId}", detectorId);

            DataTable dt = await this._kustoQueryService.ExecuteClusterQuery(monitoringSummaryQuery);

            Dictionary<string, string> monitoringSummary = new Dictionary<string, string>();

            if (dt == null || dt.Rows == null || dt.Rows.Count == 0)
            {
                return monitoringSummary;
            }

            // totalReqs = count(), failedReqs = countif(StatusCode>=500), avgLatency = avg(LatencyInMilliseconds), p90Latency = percentiles(LatencyInMilliseconds, 90)
            monitoringSummary.Add("Availability", dt.Rows[0]["availability"].ToString());
            monitoringSummary.Add("TotalRequests", dt.Rows[0]["totalReqs"].ToString());
            monitoringSummary.Add("FailedRequests", dt.Rows[0]["failedReqs"].ToString());
            monitoringSummary.Add("AverageLatency", dt.Rows[0]["avgLatency"].ToString());
            monitoringSummary.Add("P90Latency", dt.Rows[0]["p90Latency"].ToString());

            return monitoringSummary;

         
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
