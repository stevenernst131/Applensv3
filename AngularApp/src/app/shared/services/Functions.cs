#r "D:\home\site\wwwroot\bin\Microsoft.Azure.Services.AppAuthentication.dll"
#r "D:\home\site\wwwroot\bin\Microsoft.Azure.Keyvault.dll"
#r "D:\home\site\wwwroot\bin\Microsoft.IdentityModel.Clients.ActiveDirectory.dll"

using System;
using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.Azure.KeyVault;
using System.Net.Http.Headers;
using System.Net.Http;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using System.Globalization;

// static HttpClient client = new HttpClient();
public static string Run(TimerInfo myTimer, TraceWriter log)
{

    ///
            AuthenticationContext authContext = null;
            string token = null;

            //    var authority = string.Format(CultureInfo.InvariantCulture, "https://login.microsoftonline.com", "72f988bf-86f1-41af-91ab-2d7cd011db47");
            var authority = "https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47";
            var ClientId = "cb9cea9b-8d15-45c3-9cec-c380a9299e52";
            var ClientKey = "LUOcn51HgFDbAGp3Yph98ZFwShF6PpcVW+GfhwwUpIU=";
            authContext = new AuthenticationContext(authority);

            var clientCreds = new ClientCredential(ClientId, ClientKey);
            var resourceId = "192bd8f2-c844-4977-aefd-77407619e80c";
            var result = authContext.AcquireTokenAsync(resourceId, clientCreds).GetAwaiter().GetResult();
            token = result.AccessToken;
            log.Info(token);

    //////

            var handler = new HttpClientHandler();

            var client = new HttpClient(handler)
            {
                BaseAddress = new Uri("https://applens.azurewebsites.net/"),
                Timeout = TimeSpan.FromSeconds(5 * 60),
                MaxResponseContentBufferSize = Int32.MaxValue
            };

            client.DefaultRequestHeaders.Add("x-ms-internal-client", "true");
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, "api/invoke");
                requestMessage.Headers.Add("Authorization", new AuthenticationHeaderValue("Bearer", token));
                requestMessage.Headers.Add("Accept", "application/json");
                requestMessage.Headers.Add("x-ms-path-query", "v4/subscriptions/1402be24-4f35-4ab7-a212-2cd496ebdf14/resourcegroups/badsites/providers/Microsoft.Web/sites/highcpuscenario/detectors");
                requestMessage.Headers.Add("x-ms-method", "POST");
                requestMessage.Headers.Add("x-ms-internal-view", "true");
                requestMessage.Headers.Add("x-ms-internal-client", "true");
                //     requestMessage.Content = new StringContent(body?.ToString() ?? string.Empty, Encoding.UTF8, "application/json");
                requestMessage.Content = new StringContent("");
                requestMessage.Content.Headers.ContentType = MediaTypeHeaderValue.Parse("application/json");
                //    var response = _client.SendAsync(requestMessage).Result.Content.ReadAsStringAsync().Result;


                var response = client.SendAsync(requestMessage).Wait().Result;

    log.Info(response);

    log.Info($"Scheduled Email Alert executed at: {DateTime.Now}");

    // var azureServiceTokenProvider = new AzureServiceTokenProvider();
    // string accessToken =  azureServiceTokenProvider.GetAccessTokenAsync("https://applens.azurewebsites.net").GetAwaiter.GetResult();
    // var accessToken = accessTokenTask.Result;

    var azureServiceTokenProvider = new AzureServiceTokenProvider();
   // var accessTokenTask = azureServiceTokenProvider.GetAccessTokenAsync("https://localhost:5000"); 

    var accessTokenTask = azureServiceTokenProvider.GetAccessTokenAsync("https://applens.azurewebsites.net"); 
 
    accessTokenTask.Wait();
    var accessToken = accessTokenTask.Result;
 

     log.Info($"{accessToken}");
     
     // https://applens.azurewebsites.net
     var url = "https://applens.azurewebsites.net/api/github/detectortemplate/appcrashes";
  //  var url1 = "https://localhost:5000/api/github/detectortemplate/appcrashes";
  //  client.DefaultRequestHeaders.Authorization =  new AuthenticationHeaderValue("Bearer", token);
 
  //  var responseTask = client.GetStringAsync(url);
    // responseTask.Wait();
    // var response = responseTask.Result;

    return response;
}
