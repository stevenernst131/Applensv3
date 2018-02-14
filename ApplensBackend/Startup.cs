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

            services.AddMvc ();
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

            app.UseDefaultFiles ();
            app.UseStaticFiles ();
        }
    }
}