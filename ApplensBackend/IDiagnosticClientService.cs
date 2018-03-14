using System.Net.Http;
using System.Threading.Tasks;

namespace AppLensV3
{
    public interface IDiagnosticClientService
    {
         Task<dynamic> Get(string path);
    }
}