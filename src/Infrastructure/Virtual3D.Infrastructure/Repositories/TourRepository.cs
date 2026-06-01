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

        /// <summary>
        /// Get all tours
        /// </summary>
        /// <returns>List of tours</returns>
        public async Task<IEnumerable<Tour>> GetToursAsync()
        {
            return await _context.Tours
                .Include(t => t.Listing)
                .Include(t => t.Rooms)
                .ToListAsync();
        }

        /// <summary>
        /// Get a tour by ID
        /// </summary>
        /// <param name="id">Tour ID</param>
        /// <returns>Tour object</returns>
        public async Task<Tour?> GetTourByIdAsync(string id)
        {
            return await _context.Tours
                .Include(t => t.Listing)
                .Include(t => t.Rooms)
                    .ThenInclude(r => r.Hotspots)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        /// <summary>
        /// Create a new tour
        /// </summary>
        /// <param name="tour">Tour object</param>
        /// <returns>Created tour</returns>
        public async Task<Tour> CreateTourAsync(Tour tour)  
        {
            if (tour.Listing != null)
            {
                _context.Listings.Add(tour.Listing);
            }
            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();
            return tour;
        }

        /// <summary>
        /// Update a tour
        /// </summary>
        /// <param name="tour">Tour object</param>
        /// <returns>Updated tour</returns>
        public async Task UpdateTourAsync(Tour tour)
        {
            _context.Entry(tour).State = EntityState.Modified;
            if (tour.Listing != null)
            {
                _context.Entry(tour.Listing).State = EntityState.Modified;
            }
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Delete a tour
        /// </summary>
        /// <param name="id">Tour ID</param>
        /// <returns>Deleted tour</returns>
        public async Task DeleteTourAsync(string id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour != null)
            {
                _context.Tours.Remove(tour);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Get a room by ID
        /// </summary>
        /// <param name="id">Room ID</param>
        /// <returns>Room object</returns>
        public async Task<Room?> GetRoomByIdAsync(string id)
        {
            return await _context.Rooms.FindAsync(id);
        }

        /// <summary>
        /// Create a new room
        /// </summary>
        /// <param name="tourId">Tour ID</param>
        /// <param name="room">Room object</param>
        /// <returns>Created room</returns>
        public async Task<Room> CreateRoomAsync(string tourId, Room room)
        {
            room.TourId = tourId;
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return room;
        }

        /// <summary>
        /// Update a room
        /// </summary>
        /// <param name="room">Room object</param>
        /// <returns>Updated room</returns>
        public async Task UpdateRoomAsync(Room room)
        {
            _context.Entry(room).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Delete a room
        /// </summary>
        /// <param name="id">Room ID</param>
        /// <returns>Deleted room</returns>
        public async Task DeleteRoomAsync(string id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room != null)
            {
                _context.Rooms.Remove(room);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Get a hotspot by ID
        /// </summary>
        /// <param name="id">Hotspot ID</param>
        /// <returns>Hotspot object</returns>
        public async Task<Hotspot?> GetHotspotByIdAsync(string id)
        {
            return await _context.Hotspots.FindAsync(id);
        }

        /// <summary>
        /// Create a new hotspot
        /// </summary>
        /// <param name="roomId">Room ID</param>
        /// <param name="hotspot">Hotspot object</param>
        /// <returns>Created hotspot</returns>
        public async Task<Hotspot> CreateHotspotAsync(string roomId, Hotspot hotspot)
        {
            hotspot.RoomId = roomId;
            _context.Hotspots.Add(hotspot);
            await _context.SaveChangesAsync();
            return hotspot;
        }

        /// <summary>
        /// Update a hotspot
        /// </summary>
        /// <param name="hotspot">Hotspot object</param>
        /// <returns>Updated hotspot</returns>
        public async Task UpdateHotspotAsync(Hotspot hotspot)
        {
            _context.Entry(hotspot).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Delete a hotspot
        /// </summary>
        /// <param name="id">Hotspot ID</param>
        /// <returns>Deleted hotspot</returns>
        public async Task DeleteHotspotAsync(string id)
        {
            var hotspot = await _context.Hotspots.FindAsync(id);
            if (hotspot != null)
            {
                _context.Hotspots.Remove(hotspot);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Check if tour exists
        /// </summary>
        /// <param name="id">Tour ID</param>
        /// <returns>True if tour exists, false otherwise</returns>
        public async Task<bool> TourExistsAsync(string id)
        {
            return await _context.Tours.AnyAsync(t => t.Id == id);
        }

        /// <summary>
        /// Check if room exists
        /// </summary>
        /// <param name="id">Room ID</param>
        /// <returns>True if room exists, false otherwise</returns>
        public async Task<bool> RoomExistsAsync(string id)
        {
            return await _context.Rooms.AnyAsync(r => r.Id == id);
        }

        /// <summary>
        /// Save changes
        /// </summary>
        /// <returns>Void</returns>
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
