﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Data.SqlClient;
using Dapper;
using Dapper.Contrib.Extensions;
using Kusto.Data.Net.Client;
using System.Dynamic;
using Kusto.Data;

namespace AppLensV3.Controllers
{
    [Produces("application/json")]
    [Route("api/casecleansing")]
    [Authorize]
    public class CaseCleansingController : Controller
    {
        public class CaseSimple{
            public string IncidentId { get; set; }
            public DateTime Time { get; set; }
            public string Status { get; set; }
            public string AssignedTo { get; set; }
            public DateTime ClosedTime { get; set; }
            public int ID { get; set; }
            public int RecomendationCount { get; set; }
        }

        public class CaseExtra
        {
            public Recommendation[] Recommendations { get; set; }
            public dynamic KustoData { get; set; }
        }

        public class Recommendation
        {
            public string RuleName { get; set; }
            public string OldClosedAgainst { get; set; }
            public string RecommendedClosedAgainst { get; set; }
            public DateTime RecomendationDate { get; set; }
        }

        private ICaseCleansingClientService _caseCleansingService;

        public CaseCleansingController(ICaseCleansingClientService caseCleansingService)
        {
            _caseCleansingService = caseCleansingService;
        }

        [HttpGet("GetAllCases")]
        public CaseSimple[] Get()
        {
            string str = @"select IncidentId, Time, Status, AssignedTo, ClosedTime, Incidents.ID As ID, Count(RuleID) As RecomendationCount
from Incidents 
JOIN Statuses ON Statuses.Id=Incidents.ID
JOIN Recomendations ON Recomendations.Id=Incidents.ID
WHERE Status = 'OPEN'
Group by IncidentId, Time, Status, AssignedTo, ClosedTime, Incidents.ID
order by Time Desc;";
            
            using (SqlConnection connection = new SqlConnection(_caseCleansingService.GetConnectionString()))
            {
                var res = connection.Query<CaseSimple>(str);
                return res.ToArray();
            }
        }

        [HttpGet("GetCase/{id}")]
        public CaseExtra Get(string id)
        {
            CaseExtra extra = new CaseExtra();
            //Get Recommendations from SQL
            string SQLQueryString = @"select RuleName, OldClosedAgainst, RecommendedClosedAgainst, Recomendations.Date As RecomendationDate
from Incidents 
JOIN Recomendations ON Recomendations.Id=Incidents.ID
JOIN Rules ON Recomendations.RuleId=Rules.RuleId
WHERE IncidentId = @IncidentId;";

            using (SqlConnection connection = new SqlConnection(_caseCleansingService.GetConnectionString()))
            {
                var res = connection.Query<Recommendation>(SQLQueryString, new { IncidentId = id });
                extra.Recommendations = res.ToArray();
            }

            //Get More Info from Kusto
            string kustoQueryString = $@"SupportProductionClosedVolumeMonthlyVer1023
                | where Incidents_IncidentId == {id}";

            var queryProvider = KustoClientFactory.CreateCslQueryProvider(_caseCleansingService.GetKustoP360ConnectionString());

            var reader = queryProvider.ExecuteQuery(kustoQueryString);

            dynamic kustoResult = new ExpandoObject();

            if (reader.Read())
            {
                var dictionary = (IDictionary<string, object>)kustoResult;
                for (int i = 0; i < reader.FieldCount; ++i)
                {
                    dictionary[reader.GetName(i)] = reader.GetValue(i);
                }
            }
            else
            {
                kustoResult.Error = "Result no longer in DB";
            }

            extra.KustoData = kustoResult;

            return extra;
        }
    }
}
