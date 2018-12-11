import { Component, OnInit } from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubApiService } from '../../../../shared/services/github-api.service';
import { Commit } from '../../../../diagnostic-data/models/changelist';
import { Dictionary } from '../../../../shared/models/extensions';


@Component({
  selector: 'tab-detector-changelist',
  templateUrl: './tab-detector-changelist.component.html',
  styleUrls: ['./tab-detector-changelist.component.css']
})

export class TabDetectorChangelistComponent implements OnInit {

  private detectorId;
  commitsList: Commit[];
  currentSha: string;
  previousSha: string;
  previousCode: string;
  currentCode: string;

  constructor(private _route: ActivatedRoute, private githubService: GithubApiService) { }



  ngOnInit() {
    this.detectorId = this._route.parent.snapshot.params['detector'];
    console.log(`id: ${this.detectorId}`);
    let changelist = this.githubService.getDetectorChangelist(this.detectorId);



    changelist.subscribe(commits => {
      console.log(commits);
      console.log(typeof commits);
      // if (commits) {
      //   commits.forEach(element => {
      //     console.log(element);
      //     // let onClick = () => {
      //     //   this.currentSha = element.Key;
      //     //   this.previousSha = element.Value.Item4;
      //     // };
      //   });
      // };
    });
  }
  



  options = {
    theme: 'vs-dark'
  };
  originalModel: DiffEditorModel = {
    code: `heLLo world!
    using System.Linq;
using System.Text.RegularExpressions;
using System.Xml.Linq;

private static List<RuntimeSitenameTimeRange> slotRuntimeRange;

[AppFilter(AppType = AppType.WebApp | AppType.FunctionApp, PlatformType = PlatformType.Windows, StackType = StackType.All,  InternalOnly = false)]
[Definition(Id = "appcrashes", Name = "Application Crashes", Category = Categories.AvailabilityAndPerformance, Author = "shgup", Description = "Detects Application crashes and related events for your application.")]
public async static Task<Response> Run(DataProviders dp, OperationContext<App> cxt, Response res)
{       
    var crashInfo = await GetCrashInformation(dp, cxt, res);

    DataTable crashTimelineTable = crashInfo.Item1;
    var filteredEvents = crashInfo.Item2;
    
    bool crashDetected = crashTimelineTable != null && crashTimelineTable.Rows != null && crashTimelineTable.Rows.Count > 0;

    if (crashDetected)
    {
        AddCrashInsightToResponse(res, cxt, filteredEvents);
        AddCrashTimeLineToResponse(crashTimelineTable, res);
        List<EventLog> eventLogs = await GetEventLogs(dp, cxt, res);
        AddEventLogsToResponse(eventLogs, cxt.Resource, res);
    }
    else
    {
        AddNoCrashInsightToResponse(res);
    `,
    language: 'text/plain'
  };

  modifiedModel: DiffEditorModel = {
    code: `hello orlando!
    using System;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using Diagnostics.DataProviders;
using Diagnostics.ModelsAndUtils;
using Diagnostics.ModelsAndUtils.Attributes;
using Diagnostics.ModelsAndUtils.Models;
using Diagnostics.ModelsAndUtils.Models.ResponseExtensions;
using Diagnostics.ModelsAndUtils.ScriptUtilities;
using Newtonsoft.Json;
using System.Linq;
using System.Text.RegularExpressions;
using System.Xml.Linq;

private static List<RuntimeSitenameTimeRange> slotRuntimeRange;

[AppFilter(AppType = AppType.WebApp | AppType.FunctionApp, PlatformType = PlatformType.Windows, StackType = StackType.All,  InternalOnly = false)]
[Definition(Id = "appcrashes", Name = "Application Crashes", Category = Categories.AvailabilityAndPerformance, Author = "shgup", Description = "Detects Application crashes and related events for your application.")]
public async static Task<Response> Run(DataProviders dp, OperationContext<App> cxt, Response res)
{       
    var crashInfo = await GetCrashInformation(dp, cxt, res);

    DataTable crashTimelineTable = crashInfo.Item1;
    var filteredEvents = crashInfo.Item2;
    
    bool crashDetected = crashTimelineTable != null && crashTimelineTable.Rows != null && crashTimelineTable.Rows.Count > 0;

    if (crashDetected)
    {
        AddCrashInsightToResponse(res, cxt, filteredEvents);
        AddCrashTimeLineToResponse(crashTimelineTable, res);
        List<EventLog> eventLogs = await GetEventLogs(dp, cxt, res);
        AddEventLogsToResponse(eventLogs, cxt.Resource, res);
    }
    else
    {
        AddNoCrashInsightToResponse(res);
    }

    AddUsefulLinksToResponse(res);
    
    return res;
}

private static async Task<Tuple<DataTable, List<SiteCrashEvent>>> GetCrashInformation(DataProviders dp, OperationContext<App> cxt, Response res)
{
    string slotName = GetSlotName(cxt.Resource.Name);
    var slotInfoTask = dp.Observer.GetRuntimeSiteSlotMap(cxt.Resource.Stamp.InternalName, cxt.Resource.Name);
    DataTable kustoTable = await dp.Kusto.ExecuteQuery(GetCrashTimeLineQuery(cxt), cxt.Resource.Stamp.InternalName);
    if (kustoTable == null || kustoTable.Rows == null || kustoTable.Rows.Count <= 0)
    {
        return Tuple.Create<DataTable,List<SiteCrashEvent>>(kustoTable, null);
    }

    var slotInfo = await slotInfoTask;
    if (!slotInfo.ContainsKey(slotName))
    {
        throw new Exception($"RuntimeSlotMap Dictionary doesnt have key for slot name : {slotName}");
    }

    slotRuntimeRange = slotInfo[slotName];
    List<SiteCrashEvent> crashEvents = new List<SiteCrashEvent>();
    foreach (DataRow row in kustoTable.Rows)
    {
        string siteName = row["SiteName"].ToString();
        if (!string.IsNullOrWhiteSpace(row["ApplicationPool"].ToString()))
        {
            siteName = row["ApplicationPool"].ToString();
        }

        crashEvents.Add(new SiteCrashEvent()
        {
            TimeStamp = GetDateTimeInUtcFormat(DateTime.Parse(row["PreciseTimeStamp"].ToString())),
            SiteName = siteName,
            ExitCode = row["ExitCode"].ToString()
        });
    }

    List<SiteCrashEvent> filteredEvents = MergetSlotTimeAndSiteEvents<SiteCrashEvent>(crashEvents, slotRuntimeRange);

    var table = ToDataTable(filteredEvents, TimeSpan.FromMinutes(5));

    return Tuple.Create(table, filteredEvents);

}

private static void AddNoCrashInsightToResponse(Response res)
{
    res.AddInsight(new Insight(InsightStatus.Success, "No Application crashes detected during this timeframe"));
}

private static void AddCrashInsightToResponse(Response res, OperationContext<App> cxt, List<SiteCrashEvent> filteredEvents)
{
    var insightDetails = new Dictionary<string, string>
    {
        { "Description", $"<markdown>We detected crashes in your application `,
    language: 'text/plain'
  };

}
