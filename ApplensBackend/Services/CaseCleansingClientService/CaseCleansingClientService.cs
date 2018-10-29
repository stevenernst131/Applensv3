using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace AppLensV3
{
    public class CaseCleansingClientService : ICaseCleansingClientService
    {
        private IConfiguration _configuration;

        public CaseCleansingClientService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GetConnectionString()
        {
            return _configuration["CaseCleansing:ConnectionString"];
        }

        public string GetKustoP360ConnectionString()
        {
            return _configuration["CaseCleansing:KustoP360ConnectionString"];
        }
    }
}
