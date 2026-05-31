using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Virtual3D.Application.Interfaces;
using Virtual3D.Domain.Entities;
using Virtual3D.Infrastructure.Data;

namespace Virtual3D.Infrastructure.Repositories
{
    public class TourRepository : ITourRepository
    {
        private readonly TourDbContext _context;

        public TourRepository(TourDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tour>> GetToursAsync()
        {
            return await _context.Tours
                .Include(t => t.Rooms)
                .ToListAsync();
        }

        public async Task<Tour?> GetTourByIdAsync(string id)
        {
            return await _context.Tours
                .Include(t => t.Rooms)
                    .ThenInclude(r => r.Hotspots)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Tour> CreateTourAsync(Tour tour)
        {
            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();
            return tour;
        }

        public async Task UpdateTourAsync(Tour tour)
        {
            _context.Entry(tour).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteTourAsync(string id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour != null)
            {
                _context.Tours.Remove(tour);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Room?> GetRoomByIdAsync(string id)
        {
            return await _context.Rooms.FindAsync(id);
        }

        public async Task<Room> CreateRoomAsync(string tourId, Room room)
        {
            room.TourId = tourId;
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task UpdateRoomAsync(Room room)
        {
            _context.Entry(room).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRoomAsync(string id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room != null)
            {
                _context.Rooms.Remove(room);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Hotspot?> GetHotspotByIdAsync(string id)
        {
            return await _context.Hotspots.FindAsync(id);
        }

        public async Task<Hotspot> CreateHotspotAsync(string roomId, Hotspot hotspot)
        {
            hotspot.RoomId = roomId;
            _context.Hotspots.Add(hotspot);
            await _context.SaveChangesAsync();
            return hotspot;
        }

        public async Task UpdateHotspotAsync(Hotspot hotspot)
        {
            _context.Entry(hotspot).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteHotspotAsync(string id)
        {
            var hotspot = await _context.Hotspots.FindAsync(id);
            if (hotspot != null)
            {
                _context.Hotspots.Remove(hotspot);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> TourExistsAsync(string id)
        {
            return await _context.Tours.AnyAsync(t => t.Id == id);
        }

        public async Task<bool> RoomExistsAsync(string id)
        {
            return await _context.Rooms.AnyAsync(r => r.Id == id);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
