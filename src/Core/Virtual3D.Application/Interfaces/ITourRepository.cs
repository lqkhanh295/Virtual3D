using System.Collections.Generic;
using System.Threading.Tasks;
using Virtual3D.Domain.Entities;

namespace Virtual3D.Application.Interfaces
{
    public interface ITourRepository
    {
        Task<IEnumerable<Tour>> GetToursAsync();
        Task<Tour?> GetTourByIdAsync(string id);
        Task<Tour> CreateTourAsync(Tour tour);
        Task UpdateTourAsync(Tour tour);
        Task DeleteTourAsync(string id);

        Task<Room?> GetRoomByIdAsync(string id);
        Task<Room> CreateRoomAsync(string tourId, Room room);
        Task UpdateRoomAsync(Room room);
        Task DeleteRoomAsync(string id);

        Task<Hotspot?> GetHotspotByIdAsync(string id);
        Task<Hotspot> CreateHotspotAsync(string roomId, Hotspot hotspot);
        Task UpdateHotspotAsync(Hotspot hotspot);
        Task DeleteHotspotAsync(string id);
        
        Task<bool> TourExistsAsync(string id);
        Task<bool> RoomExistsAsync(string id);
        Task SaveChangesAsync();
    }
}
