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
        internal const string DetectorTemplatePath = "https://raw.githubusercontent.com/Azure/Azure-AppServices-Diagnostics/master/data/templates/Detector_KustoQuery.csx";
        internal const string DetectorFilePathFormat = "https://api.github.com/repos/PraveenTB/Azure-AppServices-Diagnostics-DataScripts/contents/{0}/{0}.csx?ref=master&access_token={1}";
    }
}
