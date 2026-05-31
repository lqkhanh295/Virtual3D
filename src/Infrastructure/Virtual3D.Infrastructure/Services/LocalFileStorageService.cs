using System;
using System.IO;
using System.Threading.Tasks;
using Virtual3D.Application.Interfaces;

namespace Virtual3D.Infrastructure.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        public async Task<string> SaveFileAsync(Stream fileStream, string fileName)
        {
            if (fileStream == null || fileStream.Length == 0)
            {
                throw new ArgumentException("No file stream or empty stream provided.", nameof(fileStream));
            }

            // Target uploads folder inside wwwroot
            string contentRoot = Directory.GetCurrentDirectory();
            string uploadsFolder = Path.Combine(contentRoot, "wwwroot", "uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(fileName);
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var destinationStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(destinationStream);
            }

            return $"/uploads/{uniqueFileName}";
        }
    }
}
