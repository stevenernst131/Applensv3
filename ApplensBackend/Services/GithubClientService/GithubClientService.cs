using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using AppLensV3.Models;

namespace AppLensV3
{
    public class GithubClientService : IGithubClientService
    {
        private ConcurrentDictionary<string, Tuple<string, object>> _gitHubCache;
        private HttpClient _httpClient;

        public GithubClientService()
        {
            _gitHubCache = new ConcurrentDictionary<string, Tuple<string, object>>();
            InitializeHttpClient();
        }

        public async Task<string> GetFileContent(string url)
        {
            TryGetETAGAndCacheValue(url, out string etag, out object cachedValue, out bool isEntryInCache);
            HttpResponseMessage response = await GetInternal(url, etag);
            if (response.StatusCode == HttpStatusCode.NotModified)
            {
                if (isEntryInCache)
                {
                    return cachedValue.ToString();
                }

                throw new Exception($"url content not found in cache : {url}");
                // TODO : If entry is not in cache for some reason, we need to fetch it again from github without etag header to refresh the cache
            }

            response.EnsureSuccessStatusCode();
            cachedValue = await response.Content.ReadAsStringAsync();
            etag = GetHeaderValue(response, "ETag").Replace("W/", string.Empty);
            Tuple<string, object> cachedInfo = new Tuple<string, object>(etag, cachedValue);
            _gitHubCache.AddOrUpdate(url, cachedInfo, (key, oldvalue) => cachedInfo);

            return cachedValue.ToString();
        }

        public async Task<GithubEntry> Get(string url)
        {
            TryGetETAGAndCacheValue(url, out string etag, out object cachedValue, out bool isEntryInCache);
            HttpResponseMessage response = await GetInternal(url, etag);
            if (response.StatusCode == HttpStatusCode.NotModified)
            {
                if (isEntryInCache)
                {
                    return (GithubEntry)cachedValue;
                }

                throw new Exception($"url content not found in cache : {url}");
                // TODO : If entry is not in cache for some reason, we need to fetch it again from github without etag header to refresh the cache
            }

            response.EnsureSuccessStatusCode();
            cachedValue = await response.Content.ReadAsAsyncCustom<GithubEntry>();
            etag = GetHeaderValue(response, "ETag").Replace("W/", string.Empty);
            Tuple<string, object> cachedInfo = new Tuple<string, object>(etag, cachedValue);
            _gitHubCache.AddOrUpdate(url, cachedInfo, (key, oldvalue) => cachedInfo);

            return (GithubEntry)cachedValue;
        }

        private async Task<HttpResponseMessage> GetInternal(string url, string etag)
        {
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, url);
            if (!string.IsNullOrWhiteSpace(etag))
            {
                request.Headers.Add("If-None-Match", etag);
            }

            HttpResponseMessage response = await _httpClient.SendAsync(request);

            if (response.StatusCode >= HttpStatusCode.NotFound)
            {
                string exceptionDetails = await response.Content.ReadAsStringAsync();
                throw new Exception($"Github call failed. Http Status Code : {response.StatusCode}, Exception : {exceptionDetails}");
            }

            return response;
        }

        private void TryGetETAGAndCacheValue(string url, out string etag, out object cachedValue, out bool isEntryInCache)
        {
            etag = string.Empty;
            cachedValue = null;
            isEntryInCache = _gitHubCache.TryGetValue(url, out Tuple<string, object> cachedInfo);

            if (isEntryInCache)
            {
                etag = cachedInfo.Item1.ToString();
                cachedValue = cachedInfo.Item2;
            }
        }

        private void InitializeHttpClient()
        {
            _httpClient = new HttpClient
            {
                MaxResponseContentBufferSize = Int32.MaxValue,
                Timeout = TimeSpan.FromSeconds(30)
            };

            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "applensv3");
        }

        private string GetHeaderValue(HttpResponseMessage responseMsg, string headerName)
        {
            if (responseMsg.Headers.TryGetValues(headerName, out IEnumerable<string> values))
            {
                return values.FirstOrDefault() ?? string.Empty;
            }

            return string.Empty;
        }
    }
}
