using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace AppLensV3 {
    public class Startup {
        public Startup (IHostingEnvironment env) {

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            if (env.IsDevelopment())
            {
                builder.AddApplicationInsightsSettings(developerMode: true);
            }

            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices (IServiceCollection services) {            

            services.AddApplicationInsightsTelemetry(Configuration);

            services.AddSingleton<IConfiguration>(Configuration);

            services.AddSingleton<IObserverClientService, SupportObserverClientService>();
            services.AddSingleton<IDiagnosticClientService, DiagnosticRoleClient>();
            services.AddSingleton<IGithubClientService, GithubClientService>();

            services.AddMvc ();

            services.AddAuthentication(auth =>
            {
                auth.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                auth.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie()
            .AddOpenIdConnect(opts =>
            {
                Configuration.GetSection("OpenIdConnect").Bind(opts);
            });
            //.AddOpenIdConnect(opts =>
            //{
            //    Configuration.GetSection("OpenIdConnect").Bind(opts);

            //    opts.Events = new OpenIdConnectEvents
            //    {
            //        OnAuthorizationCodeReceived = async ctx =>
            //        {
            //            HttpRequest request = ctx.HttpContext.Request;
            //            //We need to also specify the redirect URL used
            //            string currentUri = UriHelper.BuildAbsolute(request.Scheme, request.Host, request.PathBase, request.Path);
            //            //Credentials for app itself
            //            var credential = new ClientCredential(ctx.Options.ClientId, ctx.Options.ClientSecret);

            //            //Construct token cache
            //            ITokenCacheFactory cacheFactory = ctx.HttpContext.RequestServices.GetRequiredService<ITokenCacheFactory>();
            //            TokenCache cache = cacheFactory.CreateForUser(ctx.Principal);

            //            var authContext = new AuthenticationContext(ctx.Options.Authority, cache);

            //            //Get token for Microsoft Graph API using the authorization code
            //            string resource = "https://graph.microsoft.com";
            //            AuthenticationResult result = await authContext.AcquireTokenByAuthorizationCodeAsync(
            //                ctx.ProtocolMessage.Code, new Uri(currentUri), credential, resource);

            //            //Tell the OIDC middleware we got the tokens, it doesn't need to do anything
            //            ctx.HandleCodeRedemption(result.AccessToken, result.IdToken);
            //        }
            //    };
            //});
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure (IApplicationBuilder app, IHostingEnvironment env) {
            
            if (env.IsDevelopment ()) {
                app.UseDeveloperExceptionPage();
            }

            // would not need cors if running in same host
            if (env.IsDevelopment())
            {
                app.UseCors(cors =>
                  cors
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowAnyOrigin()
                );
            }

            app.UseMvc ();

            app.Use(async (context, next) =>
            {
                await next();
                if (context.Response.StatusCode == 404 &&
                    !Path.HasExtension(context.Request.Path.Value) &&
                    !context.Request.Path.Value.StartsWith("/api/"))
                {
                    context.Request.Path = "/index.html";
                    await next();
                }
            });

            app.UseAuthentication();

            app.UseDefaultFiles ();
            app.UseStaticFiles ();
        }
    }
}