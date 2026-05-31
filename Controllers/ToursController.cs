using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Virtual3D.Data;
using Virtual3D.Models;

namespace Virtual3D.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly TourDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ToursController(TourDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // ==========================================
        // TOUR ENDPOINTS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetTours()
        {
            var tours = await _context.Tours
                .Include(t => t.Rooms)
                .ToListAsync();
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTour(string id)
        {
            var tour = await _context.Tours
                .Include(t => t.Rooms)
                    .ThenInclude(r => r.Hotspots)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tour == null) return NotFound();
            return Ok(tour);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTour(Tour tour)
        {
            if (string.IsNullOrEmpty(tour.Id))
            {
                tour.Id = Guid.NewGuid().ToString();
            }

            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTour), new { id = tour.Id }, tour);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTour(string id, Tour tourUpdate)
        {
            if (id != tourUpdate.Id) return BadRequest("Tour ID mismatch");

            var tour = await _context.Tours.FindAsync(id);
            if (tour == null) return NotFound();

            tour.Name = tourUpdate.Name;
            tour.Description = tourUpdate.Description;
            if (!string.IsNullOrEmpty(tourUpdate.MinimapUrl))
            {
                tour.MinimapUrl = tourUpdate.MinimapUrl;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(string id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null) return NotFound();

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // ROOM ENDPOINTS
        // ==========================================

        [HttpPost("{tourId}/rooms")]
        public async Task<IActionResult> CreateRoom(string tourId, Room room)
        {
            var tourExists = await _context.Tours.AnyAsync(t => t.Id == tourId);
            if (!tourExists) return NotFound("Tour not found");

            room.TourId = tourId;
            if (string.IsNullOrEmpty(room.Id))
            {
                room.Id = Guid.NewGuid().ToString();
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return Ok(room);
        }

        [HttpPut("rooms/{id}")]
        public async Task<IActionResult> UpdateRoom(string id, Room roomUpdate)
        {
            if (id != roomUpdate.Id) return BadRequest("Room ID mismatch");

            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            room.Name = roomUpdate.Name;
            if (!string.IsNullOrEmpty(roomUpdate.ImageUrl))
            {
                room.ImageUrl = roomUpdate.ImageUrl;
            }
            room.PosX = roomUpdate.PosX;
            room.PosY = roomUpdate.PosY;
            room.PosZ = roomUpdate.PosZ;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("rooms/{id}")]
        public async Task<IActionResult> DeleteRoom(string id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // HOTSPOT ENDPOINTS
        // ==========================================

        [HttpPost("rooms/{roomId}/hotspots")]
        public async Task<IActionResult> CreateHotspot(string roomId, Hotspot hotspot)
        {
            var roomExists = await _context.Rooms.AnyAsync(r => r.Id == roomId);
            if (!roomExists) return NotFound("Room not found");

            hotspot.RoomId = roomId;
            if (string.IsNullOrEmpty(hotspot.Id))
            {
                hotspot.Id = Guid.NewGuid().ToString();
            }

            _context.Hotspots.Add(hotspot);
            await _context.SaveChangesAsync();

            return Ok(hotspot);
        }

        [HttpPut("hotspots/{id}")]
        public async Task<IActionResult> UpdateHotspot(string id, Hotspot hotspotUpdate)
        {
            if (id != hotspotUpdate.Id) return BadRequest("Hotspot ID mismatch");

            var hotspot = await _context.Hotspots.FindAsync(id);
            if (hotspot == null) return NotFound();

            hotspot.Type = hotspotUpdate.Type;
            hotspot.TargetRoomId = hotspotUpdate.TargetRoomId;
            hotspot.Label = hotspotUpdate.Label;
            hotspot.Description = hotspotUpdate.Description;
            hotspot.PosX = hotspotUpdate.PosX;
            hotspot.PosY = hotspotUpdate.PosY;
            hotspot.PosZ = hotspotUpdate.PosZ;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("hotspots/{id}")]
        public async Task<IActionResult> DeleteHotspot(string id)
        {
            var hotspot = await _context.Hotspots.FindAsync(id);
            if (hotspot == null) return NotFound();

            _context.Hotspots.Remove(hotspot);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // FILE UPLOAD ENDPOINT
        // ==========================================

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Create uploads directory in wwwroot
            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            string relativePath = $"/uploads/{uniqueFileName}";
            return Ok(new { url = relativePath });
        }
    }
}
