using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AppLensV3.Helpers
{
    internal class Constants
    {
    }

    internal class GithubConstants
    {
        internal const string RawFileHeaderMediaType = "application/vnd.github.VERSION.raw";
        internal const string DetectorTemplatePath = "https://raw.githubusercontent.com/Azure/Azure-AppServices-Diagnostics/master/data/templates/Detector_KustoQuery.csx";
        internal const string DetectorFilePathFormat = "https://api.github.com/repos/{0}/{1}/contents/{2}/{2}.csx?ref={3}&access_token={4}";
    }
}
