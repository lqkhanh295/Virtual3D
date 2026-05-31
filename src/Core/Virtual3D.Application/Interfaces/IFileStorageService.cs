using System.IO;
using System.Threading.Tasks;

namespace Virtual3D.Application.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(Stream fileStream, string fileName);
    }
}
