﻿using AppLensV3.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace AppLensV3.Services.EmailNotificationService
{
    public static class ChartClient
    {
        private static HttpClient _httpClient = new HttpClient();

        static ChartClient()
        {
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.Timeout = TimeSpan.FromMinutes(1);
        }

        public static string GetChartContent(ChartGeneratorPostBody chartPostBody)
        {
            // HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://asdchartgenerator.azurewebsites.net/api/chart");
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:4970/api/chart");
            request.Content = new StringContent(JsonConvert.SerializeObject(chartPostBody), Encoding.UTF8, "application/json");

            var response = _httpClient.SendAsync(request).Result;

            if (!response.IsSuccessStatusCode)
            {
                return string.Empty;
            }

            string res = response.Content.ReadAsStringAsync().Result;
            return res.Trim('"');
        }
    }
}
