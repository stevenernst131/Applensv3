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
using System.IO;
using System.Reflection;
using AppLensV3.Models;
using System.Text.RegularExpressions;
using System.Globalization;

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

        private string _deflectionTrendQuery = @"
        cluster('usage360').database('Product360').{deflectionTableName}
        | where Timestamp >= ago(300d)
        | where DerivedProductIDStr in ('{pesId}')
        | where SupportTopicL2 contains '{category}'
        | where SupportTopicL3 contains '{supportTopic}'
        | where DenominatorQuantity != 0 
        | summarize qty = sum(NumeratorQuantity) / sum(DenominatorQuantity), auxQty = sum(DenominatorQuantity) by Timestamp, ProductName
        | project Timestamp , Deflection = round(100 * qty, 2)
        | sort by Timestamp asc
        ";

        private string _ascRatingQuery = @"
        cluster('azsc').database('ascmds').InsightTelemetryEvent
    | where insightCategory =~ '{detectorName}'
    | where env_time >= ago({timeRange})
    | where telemetryType == 'InsightFeedback' and env_cloud_environment == 'Prod'
    | project env_time, callerIdentity, srId,  insightTitle, insightType, insightCategory, insightImpactedResources, insightUseful, insightComment
    | summarize total = count(), usefulCount = countif(insightUseful =~ 'true')
    | extend detectorEffectiveness = usefulCount*100.0/total
";
        private string _ascRatingCommentsQuery = @"
        cluster('azsc').database('ascmds').InsightTelemetryEvent
    | where insightCategory =~ '{detectorName}'
    | where env_time >= ago({timeRange})
    | where telemetryType == 'InsightFeedback' and env_cloud_environment == 'Prod' and insightComment != ''
    | project env_time, callerIdentity, srId,  insightTitle, insightType, insightCategory, insightImpactedResources, insightUseful, insightComment
";

        private async Task<string> GetASCRatingHtmlTable (string detectorName)
        {
            string ascRatingHtml = @"
                <td bgcolor='#ffffff' align='center' width='40%' valign='middle' class='em_font1' height='220' style='bgcolor:#ffffff; font-family:'Open Sans', Arial, sans-serif; font-size:17px; '>
                    <p>
                        <span style='color:#ee5151; font-size:30px; font-weight:bold'>                
                        {ratingStarTableCell}
                        </span>
                    </p>
                    {ratingPercentageHtml}
                    <p><span style='color:dimgray; font-size:12px; font-weight:initial'>Azure Support Center Rating </span>
                    </p>
                </td>";

            string ratingStarTableCell = @"";
            string ratingPercentageHtml = @"";

            string timeRange = "7d";

            string ascRatingQueryString = _ascRatingQuery
                .Replace("{detectorName}", detectorName)
                .Replace("{timeRange}", timeRange);

            var ascRatingQueryTask = _kustoQueryService.ExecuteClusterQuery(ascRatingQueryString);
            DataTable ascRatingSumTable = await ascRatingQueryTask;


            int solidStarNum = 0;
            int halfStarNum = 0;
            int emptyStarNum = 5;

            string effectiveness = "";
            string ratingFraction = "No new feedbacks from last week";
            string newFlag = "";

            if (ascRatingSumTable.Rows.Count > 0 && ascRatingSumTable.Rows[0]["total"].ToString() != "0")
            {
                effectiveness = decimal.Parse(ascRatingSumTable.Rows[0]["detectorEffectiveness"].ToString()).ToString("0.00");
                double rating = double.Parse(effectiveness, CultureInfo.InvariantCulture);

                ratingFraction =  "(" + ascRatingSumTable.Rows[0]["usefulCount"] + "/" + ascRatingSumTable.Rows[0]["total"].ToString() + ")";
                effectiveness += "%";
                newFlag = "new";


                solidStarNum = Convert.ToInt32(rating / 20);
                halfStarNum = Convert.ToInt32(rating % 20) >= 10 ? 1 : 0;
                emptyStarNum = 5 - solidStarNum - halfStarNum;
            }


            string solidStar = "solidStar";
            for (int i = 0; i < solidStarNum; i++)
            {
                ratingStarTableCell += $@"
                        <img width='40' src='cid:{solidStar}' />
                        ";
            }

                
            for (int i = 0; i < halfStarNum; i++)
            {
                ratingStarTableCell += $@"
                        <img width='40' src='cid:halfSolidStar' />
                        ";
            }

            for (int i = 0; i < emptyStarNum; i++)
            {
                ratingStarTableCell += $@"
                        <img width='40' src='cid:emptyStar' />
                        ";
            }

            ratingPercentageHtml += $@"
                <p style='font-size:18px; font-weight:bold'>
                    {effectiveness}
                <span style='font-size:12px; font-weight:initial'>{ratingFraction} &nbsp;<span style='color:red; font-style:italic'>{newFlag}</span>
                </p>
            ";


            return ascRatingHtml.Replace("{ratingStarTableCell}", ratingStarTableCell).Replace("{ratingPercentageHtml}", ratingPercentageHtml);
        }

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
            return sendGridClient;
        }

        internal async Task<List<Tuple<string, string, string, string>>> GetSupportTopicList(JArray supppotTopicList)
        {
            try
            {
                List<Tuple<string, string, string, string>> supportTopicMappings = new List<Tuple<string, string, string, string>>();

                if (supppotTopicList == null || supppotTopicList.Count == 0)
                {
                    return supportTopicMappings;
                }

                List<Task<DataTable>> supportTopicMappingTasks = new List<Task<DataTable>>();
                foreach (var supportTopicItem in supppotTopicList)
                {
                    string supportTopicId = supportTopicItem["id"].ToString();
                    string pesId = supportTopicItem["pesId"].ToString();
                    string supportTopicMappingQuery = _supportTopicMappingQuery
                        .Replace("{id}", supportTopicId)
                        .Replace("{pesId}", pesId);

                    var supportTopicMappingQueryTask = _kustoQueryService.ExecuteClusterQuery(supportTopicMappingQuery);
                    supportTopicMappingTasks.Add(supportTopicMappingQueryTask);
                }

                var supportTopicMappingTables = await Task.WhenAll(supportTopicMappingTasks);

                if (supportTopicMappingTables != null && supportTopicMappingTables.Length > 0)
                {
                    foreach (var mappingTable in supportTopicMappingTables)
                    {
                        if (mappingTable != null && mappingTable.Rows != null && mappingTable.Rows.Count != 0)
                        {
                            string Id = mappingTable.Rows[0]["Id"].ToString();
                            string PesId = mappingTable.Rows[0]["PesId"].ToString();
                            string supportTopicL2 = mappingTable.Rows[0]["TopicL2"].ToString();
                            string supportTopicL3 = mappingTable.Rows[0]["TopicL3"].ToString();
                            supportTopicMappings.Add(new Tuple<string, string, string, string>(Id, PesId, supportTopicL2, supportTopicL3));
                        }
                    }
                }

                return supportTopicMappings;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        public async Task<Dictionary<string, string>> GetMonitoringMetricsAsync(string detectorId, string detectorName, List<Tuple<string, string, string, string>> supportTopicMappings, List<Tuple<string, string, Image, Image, string, string>> sptrends, DateTime startTime, DateTime endTime, string timeRange = "7d")
        {
            if (string.IsNullOrWhiteSpace(detectorId))
            {
                throw new ArgumentNullException("detectorId");
            }

            if (detectorId.Contains("backup") )
            {
             //  Console.WriteLine(detectorId);
            }

            Console.WriteLine(detectorId);

            try
            {
                Dictionary<string, string> monitoringSummary = new Dictionary<string, string>();
                DateTime currentTimeUTC = DateTime.UtcNow;

                string monitoringSummaryQuery = _monitoringSummaryQuery
                    .Replace("{timeRange}", timeRange)
                    .Replace("{detectorId}", detectorId);

                List<string> deflectionSumTables = new List<string> { "SupportProductionDeflectionWeeklyVer1023", "SupportProductionDeflectionMonthlyVer1023" };

                double[] totalNumerator = new double[2];
                double[] totalDenominator = new double[2];
                double[] deflectionPercentage = new double[2];
                DateTime[] datetime = new DateTime[2] { DateTime.UtcNow.AddDays(-7), DateTime.UtcNow.AddMonths(-1) };

                DateTime timePeriod = DateTime.UtcNow.AddMonths(-1);
                string htmlRows = string.Empty;
                string htmlRows1 = string.Empty;
                string htmlTable = @"
                 <table style='font-family: arial, sans-serif; border-collapse: collapse; width: 100%; padding: 0px;'>
                    <tr><td height = '35' class='em_height'>&nbsp;</td></tr>
                    <tr><td style='align: left; valign: middle; height: 45; font-size:17px; font-weight:bold;'><span> Deflection Analytics by Support Topic</span></td></tr>
                    <tr><td height = '25' class='em_height'>&nbsp;</td></tr>
                    {Rows1}
                </table>";

                //string htmlTable = @"<table style='font-family: arial, sans-serif; border-collapse: collapse; width: 100%; padding: 0px;'>
                //    {Rows}
                //</table>";

                for (int i = 0; i < supportTopicMappings.Count; i++)
                {
                    string spId = supportTopicMappings[i].Item1;
                    string pesId = supportTopicMappings[i].Item2;
                    string supportTopicL2 = supportTopicMappings[i].Item3;
                    string supportTopicL3 = supportTopicMappings[i].Item4;


                    for (int j = 0; j < deflectionSumTables.Count; j++)
                    {
                        string deflectionSumQuery = _totalDeflectionQuery.Replace("{deflectionTableName}", deflectionSumTables[j]).Replace("{category}", supportTopicL2).Replace("{supportTopic}", supportTopicL3).Replace("{pesId}", pesId);

                        var deflectionSumTask = this._kustoQueryService.ExecuteClusterQuery(deflectionSumQuery);
                        var deflectionSumDataTable = await deflectionSumTask;

                        if (deflectionSumDataTable != null && deflectionSumDataTable.Rows != null && deflectionSumDataTable.Rows.Count > 0)
                        {
                            totalNumerator[j] += Convert.ToDouble(deflectionSumDataTable.Rows[0]["Numerator"].ToString());
                            totalDenominator[j] += Convert.ToDouble(deflectionSumDataTable.Rows[0]["Denominator"].ToString());
                            datetime[j] = DateTime.Parse(deflectionSumDataTable.Rows[0]["period"].ToString());
                        }

                    }

                    List<Image> spImages = new List<Image>() { sptrends[i].Item3, sptrends[i].Item4 };

                    string imageTags = string.Empty;
                    string imageTags1= string.Empty;
                    foreach (var image in spImages)
                    {
                        //Attachment imageAttachment = new Attachment();
                        //imageAttachment.Content = image.ContentBase64Encoded;
                        //imageAttachment.Filename = $"{image.Cid}.png";
                        //imageAttachment.ContentId = image.Cid;
                        //imageAttachment.Type = "image/jpeg";
                        //imageAttachment.Disposition = "inline";

                        //attachments.Add(imageAttachment);
                        imageTags += $@"
                            <td style='border: 1px solid #dddddd; text-align: left; padding: 8px'><img src='cid:{image.Cid}' /></td>
                            ";

                        imageTags1 += $@"
                            <td style='border: 1px solid #dddddd; text-align: center; width: 50% ;padding: 8px'><img src='cid:{image.Cid}' /></td>
                            ";
                    }


                    string fullSupportTopic = supportTopicL2 + "/" + supportTopicL3;
                    string fullSupportTopicId = "[" + pesId + "-" + spId + "] ";
                    string fullSupportTopic1 = supportTopicL2 + " - " + supportTopicL3;
                    string supportTopicWeeklyDeflection = sptrends[i].Item5;
                    string supportTopicMonthlyDeflection = sptrends[i].Item6;

                    if (!String.IsNullOrWhiteSpace(imageTags))
                    {
                        htmlRows += $@"
                            <tr>
                                <td style='border: 1px solid #dddddd; text-align: left; padding: 8px;'>{fullSupportTopic}</td>
                                <td style='border: 1px solid #dddddd; text-align: left; padding: 8px;'>{supportTopicWeeklyDeflection}</td>
                                <td style='border: 1px solid #dddddd; text-align: left; padding: 8px;'>{supportTopicMonthlyDeflection}</td>
                                {imageTags}
                            </tr>
                            ";

                        htmlRows1 += $@"
                            <tr bgcolor='#f6f7f8'><td height = '8' class='em_height'>&nbsp;</td><td height = '8' class='em_height'>&nbsp;</td></tr>
                            <tr bgcolor='#f6f7f8'>
                                <td bgcolor='#f6f7f8' style='text-align: left; padding: 8px;'><span style ='font-weight: bold; font-size: 16px; color:#427ca7'><p style='color:black'>{fullSupportTopicId}</p><p>{fullSupportTopic1}</p></span>&nbsp; &nbsp; </td>
                                <td bgcolor='#f6f7f8'>&nbsp;</td>
                             </tr>
                           <tr bgcolor='#f6f7f8'>
                           <td style='text-align: cernter; padding: 8px;'>Last Week Deflection: <span style='font-weight:bold; color:#3118ef'> {supportTopicWeeklyDeflection}% &nbsp; &nbsp;</span> Last Month Deflection: <span style='font-weight:bold; color:#3118ef'>  {supportTopicMonthlyDeflection}% </span></td>
                            <td style='text-align: center; padding: 8px;'> &nbsp;</td>
                            </tr>
                            <tr bgcolor='#f6f7f8'><td height = '28' class='em_height'>&nbsp;</td></tr>
                            <tr bgcolor='#f6f7f8' style='font-weight:bold'>
                                <td style='border: 1px solid #dddddd; text-align: center; padding: 8px;'>Weekly Deflection Trend</td>
                                <td style='border: 1px solid #dddddd; text-align: center; padding: 8px;'>Monthly Deflection Trend</td>
                            </tr>
                            <tr bgcolor='#f6f7f8'>
                                {imageTags1}
                            </tr>
                            <tr><td height = '20' class='em_height'>&nbsp;</td></tr>
                            ";

                        //htmlRows += $@"
                        //        {imageTags}
                        //    ";
                    }
                }

                if (!String.IsNullOrWhiteSpace(htmlRows))
                {
                    monitoringSummary.Add("SupportTopicsTrends", htmlTable.Replace("{Rows}", htmlRows).Replace("{Rows1}", htmlRows1));
                }

                string ascStarRatingHtml = await GetASCRatingHtmlTable(detectorName);
                monitoringSummary.Add("AscStarRatingHtml", ascStarRatingHtml);

                for (int i = 0; i < totalDenominator.Count(); i++)
                {
                    if (totalDenominator[i] != 0)
                    {
                        deflectionPercentage[i] = Math.Round(100.0 * totalNumerator[i] / totalDenominator[i], 1);

                        if (i == 0)
                        {
                            monitoringSummary.Add("WeeklyDeflectionPercentage", deflectionPercentage[i].ToString());
                            monitoringSummary.Add("WeeklyNumerator", totalNumerator[i].ToString());
                            monitoringSummary.Add("WeeklyDenominator", totalDenominator[i].ToString());
                            monitoringSummary.Add("WeeklyDeflectionTimePeriod", datetime[i].ToString());
                        }
                        else
                        {
                            monitoringSummary.Add("MonthlyDeflectionPercentage", deflectionPercentage[i].ToString());
                            monitoringSummary.Add("MonthlyNumerator", totalNumerator[i].ToString());
                            monitoringSummary.Add("MonthlyDenominator", totalDenominator[i].ToString());
                            monitoringSummary.Add("MonthlyDeflectionTimePeriod", datetime[i].ToString());
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

                return monitoringSummary;
            }
            catch (Exception ex)
            {
                throw ex;
            }

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
            if (response == null)
                return;
            try
            {
                var responseString = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    //   JObject responseObjects1 = (JObject)JsonConvert.DeserializeObject(responseString);

                    JArray responseObjects = JArray.Parse(responseString);
                    foreach (var detectorObject in responseObjects)
                    {
                        JObject detectorMetadata = (JObject)detectorObject["metadata"];
                        string detectorId = detectorMetadata["id"].ToString();
                        string detectorName = detectorMetadata["name"].ToString();
                        string author = detectorMetadata["author"].ToString();
                        // List<string> supppotTopicList = JsonConvert.DeserializeObject<List<string>>(detectorMetadata["supportTopicList"].ToString());
                        JArray supppotTopicList = (JArray)detectorMetadata["supportTopicList"];

                       
                      //  Console.WriteLine(detectorId);
                        

                        List<Tuple<string, string, string, string>> supportTopicMappings = await GetSupportTopicList(supppotTopicList);
                        List<Tuple<string, string, Image, Image, string, string>> sptrends = await GetSupportTopicsTrends(supportTopicMappings);

                       

                        List<Attachment> attachments = GetImagesAttachments(sptrends);
                        //for (int i = 0; i < supportTopicMappings.Count; i++)
                        //{
                        //    List<Image> spImages = new List<Image>() { sptrends[i].Item3, sptrends[i].Item4 };
                        //    foreach (var image in spImages)
                        //    {
                        //        Attachment imageAttachment = new Attachment();
                        //        imageAttachment.Content = image.ContentBase64Encoded;
                        //        imageAttachment.Filename = $"{image.Cid}.png";
                        //        imageAttachment.ContentId = image.Cid;
                        //        imageAttachment.Type = "image/jpeg";
                        //        imageAttachment.Disposition = "inline";

                        //        attachments.Add(imageAttachment);
                        //    }
                        //}

                        string monitoringTemplateId = "d-2897fa12011e4ffab5188451a94f681d";
                        EmailAddress from = new EmailAddress("applensv2team@microsoft.com", "Applens Notification");

                        // Testing code over here
                        if (String.IsNullOrEmpty(author))
                        {
                            author = "xipeng;";
                        }

                        author = "xipeng;";


                        List<EmailAddress> authorList = FormatRecipients(author);
                        List<EmailAddress> ccList = new List<EmailAddress> { new EmailAddress("xipeng@microsoft.com", "Applens Notification") };

                        Dictionary<string, string> monitoringDictionary = await GetMonitoringMetricsAsync(detectorId, detectorName, supportTopicMappings, sptrends, new DateTime(), new DateTime());

                        var monitoringReportTemplateData = new MonitoringReportTemplateData
                        {
                            DetectorId = detectorId,
                            Availability = monitoringDictionary["Availability"],
                            TotalRequests = monitoringDictionary["TotalRequests"],
                            FailedRequests = monitoringDictionary["FailedRequests"],
                            P90Latency = monitoringDictionary["P90Latency"],
                            AverageLatency = monitoringDictionary["AverageLatency"],
                            MonitoringLink = monitoringDictionary["MonitoringLink"],
                            AnalyticsLink = monitoringDictionary["AnalyticsLink"],
                            WeeklyDeflectionPercentage = monitoringDictionary.ContainsKey("WeeklyDeflectionPercentage") ? monitoringDictionary["WeeklyDeflectionPercentage"] + "%" : "N/A",
                            WeeklyNumerator = monitoringDictionary.ContainsKey("WeeklyNumerator") ? monitoringDictionary["WeeklyNumerator"] : "N/A",
                            WeeklyDenominator = monitoringDictionary.ContainsKey("WeeklyDenominator") ? "(" + monitoringDictionary["WeeklyNumerator"] + "/" + monitoringDictionary["WeeklyDenominator"] + ")" : "",
                            WeeklyDeflectionTimePeriod = monitoringDictionary.ContainsKey("WeeklyDeflectionTimePeriod") ? monitoringDictionary["WeeklyDeflectionTimePeriod"] : "N/A",
                            MonthlyDeflectionPercentage = monitoringDictionary.ContainsKey("MonthlyDeflectionPercentage") ? monitoringDictionary["MonthlyDeflectionPercentage"] + "%" : "N/A",
                            MonthlyNumerator = monitoringDictionary.ContainsKey("MonthlyNumerator") ? monitoringDictionary["MonthlyNumerator"] : "N/A",
                            MonthlyDenominator = monitoringDictionary.ContainsKey("MonthlyDenominator") ? "(" + monitoringDictionary["MonthlyNumerator"] + "/" + monitoringDictionary["MonthlyDenominator"] + ")" : "",
                            MonthlyDeflectionTimePeriod = monitoringDictionary.ContainsKey("MonthlyDeflectionTimePeriod") ? monitoringDictionary["MonthlyDeflectionTimePeriod"] : "N/A",
                            CriticalInsightsCoverage = "N/A",
                            DetectorASCFeedback = "N/A",
                            //< img src = cid:{ image.Cid} /></ td >
                            Banner = $@"<img src='cid:banner' width='333' height='250' alt='WELCOME' style='display:block;max-width:333px;' class='em_full_img' />",
                            ApplensBg = $@"<img src='cid:applensBg' width='100%' height='53' style='display:block;font-family: Arial, sans-serif; font-size:15px; line-height:18px; color:#30373b;  font-weight:bold;' border='0' alt='LoGo Here' />",
                            SupportTopicsTrends = monitoringDictionary.ContainsKey("SupportTopicsTrends") ? monitoringDictionary["SupportTopicsTrends"] : string.Empty,
                            AscStarRatingHtml = monitoringDictionary["AscStarRatingHtml"],
                            MicrosoftLogoImage = $@"<img style='display:block;height:auto;' src='cid:microsoftLogo' width='100'>",
                            AuthorList = detectorMetadata["author"].ToString()
                        };
                        //$@"<img src=cid:123123 />"
                        //"<img src='https://www.sendwithus.com/assets/img/emailmonks/images/logo.png' width='230' height='80' style='display:block;font-family: Arial, sans-serif; font-size:15px; line-height:18px; color:#30373b;  font-weight:bold;' border='0' alt='LoGo Here' />"


                        await SendEmail(from, authorList, monitoringTemplateId, monitoringReportTemplateData, attachments);

                        // await SendEmail(from, authorList, monitoringTemplateId, monitoringReportTemplateData, ccList);
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static Dictionary<string, string> imageAttachmentsInfo = new Dictionary<string, string>()
        {
            {"microsoftLogo", @"EmailNotificationTemplate\Images\microsoftLogo.png"},
            {"applensBg", @"EmailNotificationTemplate\Images\applensBg.png"},
            {"banner", @"EmailNotificationTemplate\Images\banner.png"},
            {"solidStar", @"EmailNotificationTemplate\Images\solidStar.png"},
            {"halfSolidStar", @"EmailNotificationTemplate\Images\halfSolidStar.png"},
            {"emptyStar", @"EmailNotificationTemplate\Images\emptyStar.png"}
        };

        private List<Attachment> GetImagesAttachments(List<Tuple<string, string, Image, Image, string, string>> sptrends)
        {
            string assemPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

            List<Attachment> attachments = new List<Attachment>();

            foreach (KeyValuePair<string, string> staticImage in imageAttachmentsInfo)
            {
                string filePath = Path.Combine(assemPath, staticImage.Value);

                FileInfo fs = new FileInfo(filePath);
                Byte[] imageArray = File.ReadAllBytes(fs.FullName);
                string base64ImageRepresentation = Convert.ToBase64String(imageArray);

                if (!string.IsNullOrWhiteSpace(base64ImageRepresentation))
                {
                    Image image = new Image()
                    {
                        Cid = staticImage.Key,
                        ContentBase64Encoded = base64ImageRepresentation
                    };

                    Attachment imageAttachment = new Attachment();

                    imageAttachment.Content = image.ContentBase64Encoded;
                    imageAttachment.Filename = $"{image.Cid}.png";
                    imageAttachment.ContentId = image.Cid;
                    imageAttachment.Type = "image/jpeg";
                    imageAttachment.Disposition = "inline";

                    attachments.Add(imageAttachment);
                }
            }


            for (int i = 0; i < sptrends.Count; i++)
            {
                List<Image> spImages = new List<Image>() { sptrends[i].Item3, sptrends[i].Item4 };

                string imageTags = string.Empty;
                string imageTags1 = string.Empty;
                foreach (var image in spImages)
                {
                    Attachment imageAttachment = new Attachment();
                    imageAttachment.Content = image.ContentBase64Encoded;
                    imageAttachment.Filename = $"{image.Cid}.png";
                    imageAttachment.ContentId = image.Cid;
                    imageAttachment.Type = "image/jpeg";
                    imageAttachment.Disposition = "inline";

                    attachments.Add(imageAttachment);
                }

            }
            
                return attachments;
        }

        public async Task<Response> SendEmail(EmailAddress from, List<EmailAddress> tos, string templateId, Object dynamicTemplateData, List<Attachment> attachments = null, List<EmailAddress> ccList = null)
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

            emailMessage.AddAttachments(attachments);


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


        internal async Task<List<Tuple<string, string, Image, Image, string, string>>> GetSupportTopicsTrends(List<Tuple<string, string, string, string>> supportTopicMappings)
        {
            try
            {
                List<string> deflectionTrendsTable = new List<string>() { "SupportProductionDeflectionWeeklyVer1023", "SupportProductionDeflectionMonthlyVer1023" };
                List<Tuple<string, string, Image, Image, string, string>> result = new List<Tuple<string, string, Image, Image, string, string>>();
                foreach (var supportTopicMapping in supportTopicMappings)
                {
                    string spId = supportTopicMapping.Item1;
                    string pesId = supportTopicMapping.Item2;
                    string supportTopicL2 = supportTopicMapping.Item3;
                    string supportTopicL3 = supportTopicMapping.Item4;
                    string supportTopicWeeklyDeflection = string.Empty;
                    string supportTopicMonthlyDeflection = string.Empty;

                    List<Image> images = new List<Image>();
                    for (int i = 0; i < deflectionTrendsTable.Count; i++)
                    {
                        string trendQuery = _deflectionTrendQuery.Replace("{deflectionTableName}", deflectionTrendsTable[i]).Replace("{category}", supportTopicL2).Replace("{supportTopic}", supportTopicL3).Replace("{pesId}", pesId);
                        var trendTask = this._kustoQueryService.ExecuteClusterQuery(trendQuery);
                        DataTable trendTable = await trendTask;

                        ChartGeneratorPostBody postBody = new ChartGeneratorPostBody();
                        postBody.XAxis.Type = "string";
                        postBody.XAxis.Name = i == 0 ? "Week" : "Month";
                        postBody.YAxis.Type = "double";
                        postBody.YAxis.Name = "Deflection(%)";

                        foreach (DataRow row in trendTable.Rows)
                        {
                            postBody.XAxis.Values.Add(row["TimeStamp"]);
                            postBody.YAxis.Values.Add(row["Deflection"]);
                        }


                        // postBody.Chart.Color = new RGBColor(83, 186, 226); new RGBColor(176, 227, 153);

                        postBody.Chart.Color = new RGBColor(83, 186, 226);
                        postBody.Chart.Height = 150;
                        postBody.Chart.Width = 450;
                        postBody.Chart.ChartType = "column";

                        string chartContent = ChartClient.GetChartContent(postBody);
                        if (!string.IsNullOrWhiteSpace(chartContent))
                        {
                            Image img = new Image()
                            {
                                Cid = spId + pesId + i.ToString(),
                                ContentBase64Encoded = chartContent
                            };
                            images.Add(img);
                        }

                        string supportTopicDeflection = string.Empty;

                        if (trendTable.Rows.Count > 1)
                        {
                            supportTopicDeflection = trendTable.Rows[trendTable.Rows.Count - 1]["Deflection"].ToString();
                        }

                        if (i == 0)
                        {
                            supportTopicWeeklyDeflection = supportTopicDeflection;
                        }
                        else
                        {
                            supportTopicMonthlyDeflection = supportTopicDeflection;
                        }
                    }

                    if (images.Count > 1)
                    {
                        result.Add(new Tuple<string, string, Image, Image, string, string>(supportTopicL2, supportTopicL3, images[0], images[1], supportTopicWeeklyDeflection, supportTopicMonthlyDeflection));
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
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
                Alias = "xipeng",
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


            [JsonProperty("AnalyticsLink")]
            public string AnalyticsLink { get; set; }

            [JsonProperty("WeeklyDeflectionPercentage")]
            public string WeeklyDeflectionPercentage { get; set; }

            [JsonProperty("WeeklyNumerator")]
            public string WeeklyNumerator { get; set; }

            [JsonProperty("WeeklyDenominator")]
            public string WeeklyDenominator { get; set; }

            [JsonProperty("WeeklyDeflectionTimePeriod")]
            public string WeeklyDeflectionTimePeriod { get; set; }

            [JsonProperty("MonthlyDeflectionPercentage")]
            public string MonthlyDeflectionPercentage { get; set; }

            [JsonProperty("MonthlyNumerator")]
            public string MonthlyNumerator { get; set; }

            [JsonProperty("MonthlyDenominator")]
            public string MonthlyDenominator { get; set; }

            [JsonProperty("MonthlyDeflectionTimePeriod")]
            public string MonthlyDeflectionTimePeriod { get; set; }

            [JsonProperty("CriticalInsightsCoverage")]
            public string CriticalInsightsCoverage { get; set; }

            [JsonProperty("DetectorASCFeedback")]
            public string DetectorASCFeedback { get; set; }

            [JsonProperty("ApplensBg")]
            public string ApplensBg { get; set; }

            [JsonProperty("Banner")]
            public string Banner { get; set; }

            [JsonProperty("SupportTopicsTrends")]
            public string SupportTopicsTrends { get; set; }

            [JsonProperty("AscStarRatingHtml")]
            public string AscStarRatingHtml { get; set; }

            [JsonProperty("MicrosoftLogoImage")]
            public string MicrosoftLogoImage { get; set; }

            [JsonProperty("AuthorList")]
            public string AuthorList { get; set; }
            
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
