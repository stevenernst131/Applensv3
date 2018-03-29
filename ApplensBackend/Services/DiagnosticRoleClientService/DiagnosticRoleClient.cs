﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Extensions.Configuration;
using System.Security.Authentication;
using Newtonsoft.Json;

namespace AppLensV3
{
    public class DiagnosticRoleClient: IDiagnosticClientService
    {
        private IConfiguration _configuration;

        private HttpClient _client { get; set; }

        public string AuthCertThumbprint
        {
            get
            {
                return _configuration["DiagnosticRole:authCertThumbprint"];
            }
        }

        public string DiagnosticRoleEndpoint
        {
            get
            {
                return _configuration["DiagnosticRole:endpoint"];
            }
        }

        public DiagnosticRoleClient(IConfiguration configuration)
        {
            _configuration = configuration;
            _client = InitializeClient();
        }

        private HttpClient InitializeClient()
        {
            var handler = new HttpClientHandler();
            X509Certificate2 certificate = GetMyX509Certificate();
            handler.ClientCertificates.Add(certificate);
            handler.ClientCertificateOptions = ClientCertificateOption.Manual;
            handler.SslProtocols = SslProtocols.Tls12;
            handler.ServerCertificateCustomValidationCallback = (request, cert, chain, errors) =>
            {
                return true;
            };

            var client = new HttpClient(handler);
            client.BaseAddress = new Uri(DiagnosticRoleEndpoint);
            client.Timeout = TimeSpan.FromSeconds(5 * 60);
            client.MaxResponseContentBufferSize = Int32.MaxValue;
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            return client;
        }

        public async Task<dynamic> Execute(string method, string path)
        {
            try
            {
                HttpResponseMessage response;
                switch(method.ToUpper())
                {
                    case "POST":
                        response = await _client.PostAsync(path, null);
                        break;
                    case "GET":
                    default:
                        response = await _client.GetAsync(path);
                        break;
                    
                }

                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();

                    var responseObject = JsonConvert.DeserializeObject(responseString);
                    return responseObject;
                }

                throw new HttpRequestException(response.StatusCode.ToString());
            }
            catch(Exception)
            {
                throw;
            }
        }

        private X509Certificate2 GetMyX509Certificate()
        {
            X509Store certStore = new X509Store(StoreName.My, StoreLocation.CurrentUser);
            X509Certificate2 cert = null;

            certStore.Open(OpenFlags.ReadOnly);

            try
            {
                X509Certificate2Collection certCollection = certStore.Certificates.Find(
                                       X509FindType.FindByThumbprint,
                                       AuthCertThumbprint,
                                       false);
                // Get the first cert with the thumbprint
                if (certCollection.Count > 0)
                {
                    cert = certCollection[0];
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                certStore.Close();
            }

            if(cert == null)
            {
                throw new Exception(string.Format("Certificate with thumbprint {0} could not be found", AuthCertThumbprint));
            }

            return cert;
        }
    }
}