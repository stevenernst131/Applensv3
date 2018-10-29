using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppLensV3
{
    public interface ICaseCleansingClientService
    {
        string GetConnectionString();

        string GetKustoP360ConnectionString();
    }
}
