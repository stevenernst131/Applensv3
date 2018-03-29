using System.Net.Http;
using System.Threading.Tasks;

namespace AppLensV3
{
    public interface IDiagnosticClientService
    {
         Task<dynamic> Execute(string method, string path);
    }
}