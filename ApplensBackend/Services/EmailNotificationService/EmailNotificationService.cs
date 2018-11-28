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
using Newtonsoft.Json.Linq;

namespace AppLensV3.Services.EmailNotificationService
{
    public class EmailNotificationService : IEmailNotificationService
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
        | where Address endswith strcat('/detectors/', '{detectorId}') and  Address !contains strcat('/detectors/', '{detectorId}', '/statistics')
        | summarize resourceId = any(Address), totalReqs = count(), failedReqs = countif(StatusCode>=500), avgLatency = avg(LatencyInMilliseconds), p90Latency = percentiles(LatencyInMilliseconds, 90)
        | extend availability = 100.0 - (failedReqs*100.0/totalReqs), MonitoringLink = strcat('https://applens.azurewebsites.net', resourceId, '/monitoring'), AnalyticsLink = strcat('https://applens.azurewebsites.net', resourceId, '/analytics')
        ";


        private string _supportTopicMappingQuery = @"
        cluster('usage360').database('Product360').AllCloudSupportIncidentDataWithP360MetadataMapping
        | where Incidents_CreatedTime > ago(30d)
        | where DerivedProductIDStr in ({pesId})
        | where Incidents_CurrentTopicIdFullPath contains '{id}' 
        | extend FullId = strcat(tostring(DerivedProductIDStr), '\\', tostring('{id}')), Id = tostring({id}), PesId = tostring(DerivedProductIDStr)
        | summarize by FullId, PesId, Id,TopicL2 = tostring( Incidents_SupportTopicL2Current) , SupportTopicL3 = tostring(Incidents_SupportTopicL3Current) , TopicIdFull = tostring(Incidents_CurrentTopicIdFullPath)
        | extend TopicL3 = iff(SupportTopicL3 == 'UNKNOWN', '', SupportTopicL3)
        | project FullId, PesId, Id, TopicL2, TopicL3 
        ";


        private string _totalDeflectionQuery = @"
        cluster('usage360').database('Product360').{deflectionTableName}
        | extend period = Timestamp
        | where period >= ago(60d)
        | where SupportTopicL2 =~ '{category}'
        | where SupportTopicL3 =~ '{supportTopic}'
        | where(DerivedProductIDStr == @'{pesId}')
        | where DenominatorQuantity != 0 
        | summarize qty = sum(NumeratorQuantity) / sum(DenominatorQuantity),Numerator = sum(NumeratorQuantity), Denominator = sum(DenominatorQuantity) by period
        | top 1 by period desc
        ";

        private SendGridClient _sendGridClient { get; set; }

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
            _sendGridClient = InitializeClient();
        }


        private SendGridClient InitializeClient()
        {
            var sendGridClient = new SendGridClient(SendGridApiKey);
            //var handler = new HttpClientHandler();

            //var client = new HttpClient(handler)
            //{
            //    BaseAddress = new Uri("https://api.sendgrid.com/v3/mail/send"),
            //    Timeout = TimeSpan.FromSeconds(5 * 60),
            //    MaxResponseContentBufferSize = Int32.MaxValue
            //};

            //client.DefaultRequestHeaders.Add("content-type", "application/json");
            //client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return sendGridClient;
        }

        public async Task<Dictionary<string, string>> GetMonitoringMetricsAsync(string detectorId, List<string> supppotTopicList, DateTime startTime, DateTime endTime, string timeRange = "7d")
        {
            if (string.IsNullOrWhiteSpace(detectorId))
            {
                throw new ArgumentNullException("detectorId");
            }

            Dictionary<string, string> monitoringSummary = new Dictionary<string, string>();
            DateTime currentTimeUTC = DateTime.UtcNow;

            string monitoringSummaryQuery = _monitoringSummaryQuery
                .Replace("{timeRange}", timeRange)
                .Replace("{detectorId}", detectorId);

            List<string> deflectionSumTables = new List<string> { "SupportProductionDeflectionWeeklyVer1023", "SupportProductionDeflectionMonthlyVer1023" };

            if (supppotTopicList != null && supppotTopicList.Count > 0)
            {
                for (int i = 0; i < deflectionSumTables.Count; i++)
                {
                    double totalNumerator = 0;
                    double totalDenominator = 0;
                    double deflectionPercentage = 0;
                    DateTime timePeriod = DateTime.UtcNow.AddMonths(-1);

                    foreach (var supportTopic in supppotTopicList)
                    {
                        JObject supportTopicItem = JObject.Parse(supportTopic);
                        string supportTopicId = supportTopicItem["id"].ToString();
                        string pesId = supportTopicItem["pesId"].ToString();
                        string supportTopicMappingQuery = _supportTopicMappingQuery
                            .Replace("{id}", supportTopicId)
                            .Replace("{pesId}", pesId);

                        var supportTopicMappingQueryTask = this._kustoQueryService.ExecuteClusterQuery(supportTopicMappingQuery);
                        DataTable supportTopicMappingTable = await supportTopicMappingQueryTask;

                        if (supportTopicMappingTable != null && supportTopicMappingTable.Rows != null && supportTopicMappingTable.Rows.Count != 0)
                        {
                            string supportTopicL2 = supportTopicMappingTable.Rows[0]["TopicL2"].ToString();
                            string supportTopicL3 = supportTopicMappingTable.Rows[0]["TopicL3"].ToString();
                            string deflectionSumQuery = _totalDeflectionQuery.Replace("{deflectionTableName}", deflectionSumTables[i]).Replace("{category}", supportTopicL2).Replace("{supportTopic}", supportTopicL3).Replace("{pesId}", pesId);

                            var deflectionSumTask = this._kustoQueryService.ExecuteClusterQuery(deflectionSumQuery);
                            var deflectionSumDataTable = await deflectionSumTask;

                            if (deflectionSumDataTable != null && deflectionSumDataTable.Rows != null && deflectionSumDataTable.Rows.Count > 0)
                            {
                                totalNumerator += Convert.ToDouble(deflectionSumDataTable.Rows[0]["Numerator"].ToString());
                                totalDenominator += Convert.ToDouble(deflectionSumDataTable.Rows[0]["Denominator"].ToString());
                                timePeriod = DateTime.Parse(deflectionSumDataTable.Rows[0]["period"].ToString());
                            }
                        }
                    }

                    if (totalDenominator != 0)
                    {
                        deflectionPercentage = Math.Round(100.0 * totalNumerator / totalDenominator, 1);

                        if (i == 0)
                        {
                            monitoringSummary.Add("weeklyDeflectionPercentage", deflectionPercentage.ToString());
                            monitoringSummary.Add("weeklyNumerator", totalNumerator.ToString());
                            monitoringSummary.Add("weeklyDenominator", totalDenominator.ToString());
                            monitoringSummary.Add("weeklyDeflectionTimePeriod", timePeriod.ToString());
                        }
                        else
                        {
                            monitoringSummary.Add("montlyDeflectionPercentage", deflectionPercentage.ToString());
                            monitoringSummary.Add("monthlyNumerator", totalNumerator.ToString());
                            monitoringSummary.Add("monthlyDenominator", totalDenominator.ToString());
                            monitoringSummary.Add("weeklyDeflectionTimePeriod", timePeriod.ToString());
                        }
                    }
                }
            }


            var monitoringKustoQueryTask = this._kustoQueryService.ExecuteClusterQuery(monitoringSummaryQuery);


            DataTable monitoringDataTable = await monitoringKustoQueryTask;

            if (monitoringDataTable == null || monitoringDataTable.Rows == null || monitoringDataTable.Rows.Count == 0)
            {
                return monitoringSummary;
            }

            // totalReqs = count(), failedReqs = countif(StatusCode>=500), avgLatency = avg(LatencyInMilliseconds), p90Latency = percentiles(LatencyInMilliseconds, 90)
            monitoringSummary.Add("Availability", Convert.ToDouble(monitoringDataTable.Rows[0]["availability"]).ToString("0.00"));
            monitoringSummary.Add("TotalRequests", Convert.ToDouble(monitoringDataTable.Rows[0]["totalReqs"]).ToString());
            monitoringSummary.Add("FailedRequests", Convert.ToDouble(monitoringDataTable.Rows[0]["failedReqs"]).ToString());
            monitoringSummary.Add("AverageLatency", Convert.ToDouble(monitoringDataTable.Rows[0]["avgLatency"]).ToString("0.00"));
            monitoringSummary.Add("P90Latency", Convert.ToDouble(monitoringDataTable.Rows[0]["p90Latency"]).ToString("0.00"));
            monitoringSummary.Add("MonitoringLink", monitoringDataTable.Rows[0]["MonitoringLink"].ToString());
            monitoringSummary.Add("AnalyticsLink", monitoringDataTable.Rows[0]["AnalyticsLink"].ToString());

            Console.WriteLine(monitoringSummary);

            return monitoringSummary;
        }

        //public async Task<HttpResponseMessage> SendEmail(string method, string path, string body = null, bool internalView = true)
        //{
        //    HttpResponseMessage response = null;
        //    HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, "api/invoke");
        //    requestMessage.Headers.Add("content-type", "application/json");

        //    return response;
        //}


        public async Task SendWeeklyMonitoringReport(HttpResponseMessage response)
        {
            if (response != null)
            {
                var responseString = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    //   JObject responseObjects1 = (JObject)JsonConvert.DeserializeObject(responseString);

                    JArray responseObjects = JArray.Parse(responseString);
                    foreach (var detectorObject in responseObjects)
                    {
                        //  Console.WriteLine(detectorObject);
                        JObject detectorMetadata = (JObject)detectorObject["metadata"];

                        string detectorId = detectorMetadata["id"].ToString();
                        string author = detectorMetadata["author"].ToString();
                        List<string> supppotTopicList = JsonConvert.DeserializeObject<List<string>>(detectorMetadata["supportTopicList"].ToString());

                        string monitoringTemplateId = "d-2897fa12011e4ffab5188451a94f681d";
                        EmailAddress from = new EmailAddress("applensv2team@microsoft.com", "Applens Notification");

                        // Testing code over here
                        if (String.IsNullOrEmpty(author))
                        {
                            author = "xipeng;";
                        }

                        List<EmailAddress> authorList = FormatRecipients(author);
                        List<EmailAddress> ccList = new List<EmailAddress> { new EmailAddress("applesnsv2team@microsoft.com", "Applens Notification") };

                        Dictionary<string, string> monitoringDictionary = await GetMonitoringMetricsAsync(detectorId, supppotTopicList, new DateTime(), new DateTime());

                        if (!String.IsNullOrWhiteSpace(monitoringDictionary["weeklyDeflectionPercentage"]))
                        {
                            Console.WriteLine("haha");
                            Console.WriteLine(monitoringDictionary["weeklyDeflectionPercentage"].ToString());
                            Console.WriteLine(monitoringDictionary["monthlyDeflectionPercentage"].ToString());
                        }

                        var monitoringReportTemplateData = new MonitoringReportTemplateData
                        {
                            DetectorId = detectorId,
                            Availability = monitoringDictionary["Availability"],
                            TotalRequests = monitoringDictionary["TotalRequests"],
                            FailedRequests = monitoringDictionary["FailedRequests"],
                            P90Latency = monitoringDictionary["P90Latency"],
                            AverageLatency = monitoringDictionary["AverageLatency"],
                            MonitoringLink = monitoringDictionary["MonitoringLink"]
                        };

                        await SendEmail(from, authorList, monitoringTemplateId, monitoringReportTemplateData);
                        // await SendEmail(from, authorList, monitoringTemplateId, monitoringReportTemplateData, ccList);
                    }
                }
            }
        }

        public async Task<Response> SendEmail(EmailAddress from, List<EmailAddress> tos, string templateId, Object dynamicTemplateData, List<EmailAddress> ccList = null)
        {
            var emailMessage = new SendGridMessage();
            emailMessage.SetFrom(from);
            emailMessage.AddTos(tos);

            if (ccList != null && ccList.Count > 0)
            {
                emailMessage.AddCcs(ccList);
            }

            emailMessage.SetTemplateId(templateId);
            emailMessage.SetTemplateData(dynamicTemplateData);

            var response = await _sendGridClient.SendEmailAsync(emailMessage);
            return response;
        }

        public List<EmailAddress> FormatRecipients(string recipientString)
        {
            List<EmailAddress> recipientsList = new List<EmailAddress>();
            char[] separators = { ' ', ',', ';', ':' };

            // Currently there's a bug in sendgrid v3, email will not be sent if there are duplicates in the recipient list
            // Remove duplicates before adding to the recipient list
            string[] authors = recipientString.Split(separators, StringSplitOptions.RemoveEmptyEntries).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
            foreach (var author in authors)
            {
                EmailAddress emailAddress = new EmailAddress(author + "@microsoft.com");
                if (!recipientsList.Contains(emailAddress))
                {
                    recipientsList.Add(emailAddress);
                }
            }

            return recipientsList;
        }

        public async Task SendEmail1(string alias, string detectorId, string link, List<EmailAddress> tos, string TemplateId = "d-436ddef95ff144f28d665e7faaf01a2f", string from = "applensv2team@microsoft.com")
        {
            // Dictionary<string, string> monitoringDictionary = await GetMonitoringMetricsAsync(detectorId, new DateTime(), new DateTime());

            // var fromAddress= new EmailAddress(from, "Applens Notification");
            // var monitoringReport = new SendGridMessage();
            // monitoringReport.SetFrom(fromAddress);
            // monitoringReport.AddTos(tos);
            // monitoringReport.SetTemplateId("d-2897fa12011e4ffab5188451a94f681d");

            // string monitoringTemplateId = "d-2897fa12011e4ffab5188451a94f681d";
            // var monitoringReportTemplateData = new MonitoringReportTemplateData
            // {
            //     DetectorId = detectorId,
            //     Availability = monitoringDictionary["Availability"],
            //     TotalRequests = monitoringDictionary["TotalRequests"],
            //     FailedRequests = monitoringDictionary["FailedRequests"],
            //     P90Latency = monitoringDictionary["P90Latency"],
            //     AverageLatency = monitoringDictionary["AverageLatency"],
            //     MonitoringLink = monitoringDictionary["MonitoringLink"]
            // };

            // monitoringReport.SetTemplateData(monitoringReportTemplateData);
            //// var monitoringEmailTask =  _sendGridClient.SendEmailAsync(monitoringReport);

            // var monitoringEmailTask = SendEmail(fromAddress, tos, monitoringTemplateId, monitoringReportTemplateData);
            // var monitoringResponse =  await monitoringEmailTask;
            // Console.WriteLine(monitoringResponse.StatusCode);
            // Console.WriteLine(monitoringResponse.Headers.ToString());

            //var monitoringReportData = new ExampleTemplateData
            //{
            //    DetectorId:"Appcrashes",
            // "Availability": "98",
            // "P90Latency": "20",
            // "AverageLatency": "30",
            // "c2a_link":"https://applens.azurewebsites.net"
            //}
            var fromAddress = new EmailAddress(from, "Applens Notification");
            string publishingTemplateId = "d-436ddef95ff144f28d665e7faaf01a2f";

            //var plainTextContent = "and easy to do anywhere, even with C#";
            //var htmlContent = "<strong>and easy to do anywhere, even with C#</strong>";
            var dynamicTemplateData = new ExampleTemplateData
            {
                DetectorId = detectorId,
                Alias = alias,
                ApplensLink = link
            };

            await SendEmail(fromAddress, tos, publishingTemplateId, dynamicTemplateData);
        }

        private class MonitoringReportTemplateData
        {
            [JsonProperty("DetectorId")]
            public string DetectorId { get; set; }

            [JsonProperty("Availability")]
            public string Availability { get; set; }

            [JsonProperty("P90Latency")]
            public string P90Latency { get; set; }

            [JsonProperty("TotalRequests")]
            public string TotalRequests { get; set; }

            [JsonProperty("FailedRequests")]
            public string FailedRequests { get; set; }

            [JsonProperty("AverageLatency")]
            public string AverageLatency { get; set; }

            [JsonProperty("MonitoringLink")]
            public string MonitoringLink { get; set; }
        }

        private class ExampleTemplateData
        {
            [JsonProperty("DetectorId")]
            public string DetectorId { get; set; }

            [JsonProperty("Alias")]
            public string Alias { get; set; }

            [JsonProperty("ApplensLink")]
            public string ApplensLink { get; set; }
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
