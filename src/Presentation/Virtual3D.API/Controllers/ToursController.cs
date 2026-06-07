using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using Virtual3D.Application.Interfaces;
using Virtual3D.Domain.Entities;

namespace Virtual3D.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly ITourRepository _repository;
        private readonly IFileStorageService _fileStorage;

        public ToursController(ITourRepository repository, IFileStorageService fileStorage)
        {
            _repository = repository;
            _fileStorage = fileStorage;
        }

        // ==========================================
        // TOUR ENDPOINTS
        // ==========================================

        /// <summary>
        /// Get all tours
        /// </summary>
        /// <returns>List of tours</returns>
        [HttpGet]
        public async Task<IActionResult> GetTours()
        {
            var tours = await _repository.GetToursAsync();
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTour(string id)
        {
            var tour = await _repository.GetTourByIdAsync(id);
            if (tour == null) return NotFound();
            return Ok(tour);
        }

        /// <summary>
        /// Search tours by name or address
        /// </summary>
        /// <param name="query">Search query</param>
        /// <returns>List of tours</returns>
        [HttpGet("search")]
        public async Task<IActionResult> SearchTours(string query)
        {
            var tours = await _repository.SearchToursAsync(query);
            return Ok(tours);
        }

        /// <summary>
        /// Create a new tour
        /// </summary>
        /// <param name="tour">Tour object</param>
        /// <returns>Created tour</returns>
        [HttpPost]
        public async Task<IActionResult> CreateTour(Tour tour)
        {
            if (string.IsNullOrEmpty(tour.Id))
            {
                tour.Id = Guid.NewGuid().ToString();
            }

            if (tour.Listing != null)
            {
                if (string.IsNullOrEmpty(tour.Listing.Id))
                {
                    tour.Listing.Id = Guid.NewGuid().ToString();
                }
                tour.ListingId = tour.Listing.Id;
            }

            var createdTour = await _repository.CreateTourAsync(tour);
            return CreatedAtAction(nameof(GetTour), new { id = createdTour.Id }, createdTour);
        }

        /// <summary>
        /// Update a tour
        /// </summary>
        /// <param name="id">Tour ID</param>
        /// <param name="tourUpdate">Tour object</param>
        /// <returns>Updated tour</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTour(string id, Tour tourUpdate)
        {
            if (id != tourUpdate.Id) return BadRequest("Tour ID mismatch");

            var tour = await _repository.GetTourByIdAsync(id);
            if (tour == null) return NotFound();

            tour.DefaultRoomId = tourUpdate.DefaultRoomId;
            if (tourUpdate.MinimapUrl != null)
            {
                tour.MinimapUrl = tourUpdate.MinimapUrl;
            }
            if (tourUpdate.LogoUrl != null)
            {
                tour.LogoUrl = tourUpdate.LogoUrl;
            }

            if (tour.Listing != null && tourUpdate.Listing != null)
            {
                tour.Listing.Name = tourUpdate.Listing.Name;
                tour.Listing.Address = tourUpdate.Listing.Address;
                tour.Listing.PricePerMonth = tourUpdate.Listing.PricePerMonth;
                tour.Listing.AreaSqm = tourUpdate.Listing.AreaSqm;
                tour.Listing.MaxOccupants = tourUpdate.Listing.MaxOccupants;
                tour.Listing.BedroomCount = tourUpdate.Listing.BedroomCount;
                tour.Listing.BathroomCount = tourUpdate.Listing.BathroomCount;
                tour.Listing.Amenities = tourUpdate.Listing.Amenities;
                tour.Listing.Status = tourUpdate.Listing.Status;
                tour.Listing.ContactPhone = tourUpdate.Listing.ContactPhone;
                tour.Listing.ContactZalo = tourUpdate.Listing.ContactZalo;
                tour.Listing.Password = tourUpdate.Listing.Password;
            }

            await _repository.UpdateTourAsync(tour);
            return NoContent();
        }

        /// <summary>
        /// Delete a tour
        /// </summary>
        /// <param name="id">Tour ID</param>
        /// <returns>Updated tour</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(string id)
        {
            if(string.IsNullOrEmpty(id)) return BadRequest("Tour ID is required");

            var tour = await _repository.GetTourByIdAsync(id);
            if (tour == null) return NotFound();

            try
            {
                await _repository.DeleteTourAsync(id);
                return Ok(new { message = "Tour deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Delete tour failed", error = ex.Message });
            }
        }

        // ==========================================
        // ROOM ENDPOINTS
        // ==========================================

        /// <summary>
        /// Create a new room
        /// </summary>
        /// <param name="tourId">Tour ID</param>
        /// <param name="room">Room object</param>
        /// <returns>Created room</returns>
        [HttpPost("{tourId}/rooms")]
        public async Task<IActionResult> CreateRoom(string tourId, Room room)
        {
            var tourExists = await _repository.TourExistsAsync(tourId);
            if (!tourExists) return NotFound("Tour not found");

            if (string.IsNullOrEmpty(room.Id))
            {
                room.Id = Guid.NewGuid().ToString();
            }

            var createdRoom = await _repository.CreateRoomAsync(tourId, room);
            return Ok(createdRoom);
        }

        /// <summary>
        /// Update a room
        /// </summary>
        /// <param name="id">Room ID</param>
        /// <param name="roomUpdate">Room object</param>
        /// <returns>Updated room</returns>
        [HttpPut("rooms/{id}")]
        public async Task<IActionResult> UpdateRoom(string id, Room roomUpdate)
        {
            if(string.IsNullOrEmpty(id)) return BadRequest("Room ID is required");
            if(string.IsNullOrEmpty(roomUpdate.Id)) return BadRequest("Room ID is required");

            if (id != roomUpdate.Id) return BadRequest("Room ID mismatch");

            var room = await _repository.GetRoomByIdAsync(id);
            if (room == null) return NotFound();

            room.Name = roomUpdate.Name;
            if (!string.IsNullOrEmpty(roomUpdate.ImageUrl))
            {
                room.ImageUrl = roomUpdate.ImageUrl;
            }
            room.PosX = roomUpdate.PosX;
            room.PosY = roomUpdate.PosY;
            room.PosZ = roomUpdate.PosZ;
            room.MinimapX = roomUpdate.MinimapX;
            room.MinimapY = roomUpdate.MinimapY;

            await _repository.UpdateRoomAsync(room);
            return NoContent();
        }

        /// <summary>
        /// Delete a room
        /// </summary>
        /// <param name="id">Room ID</param>
        /// <returns>Updated room</returns>
        [HttpDelete("rooms/{id}")]
        public async Task<IActionResult> DeleteRoom(string id)
        {
            if(string.IsNullOrEmpty(id)) return BadRequest("Room ID is required");

            try
            {
                var room = await _repository.GetRoomByIdAsync(id);
                if (room == null) return NotFound();

                await _repository.DeleteRoomAsync(id);
                return Ok(new { message = "Room deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Delete room failed", error = ex.Message });
            }
        }

        // ==========================================
        // HOTSPOT ENDPOINTS
        // ==========================================

        /// <summary>
        /// Create a new hotspot
        /// </summary>
        /// <param name="roomId">Room ID</param>
        /// <param name="hotspot">Hotspot object</param>
        /// <returns>Created hotspot</returns>
        [HttpPost("rooms/{roomId}/hotspots")]
        public async Task<IActionResult> CreateHotspot(string roomId, Hotspot hotspot)
        {
            if(string.IsNullOrEmpty(roomId)) return BadRequest("Room ID is required");
            if(string.IsNullOrEmpty(hotspot.Id)) return BadRequest("Hotspot ID is required");

            var roomExists = await _repository.RoomExistsAsync(roomId);
            if (!roomExists) return NotFound("Room not found");

            if (string.IsNullOrEmpty(hotspot.Id))
            {
                hotspot.Id = Guid.NewGuid().ToString();
            }

            var createdHotspot = await _repository.CreateHotspotAsync(roomId, hotspot);
            return Ok(createdHotspot);
        }

        /// <summary>
        /// Update a hotspot
        /// </summary>
        /// <param name="id">Hotspot ID</param>
        /// <param name="hotspotUpdate">Hotspot object</param>
        /// <returns>Updated hotspot</returns>
        [HttpPut("hotspots/{id}")]
        public async Task<IActionResult> UpdateHotspot(string id, Hotspot hotspotUpdate)
        {
            if(string.IsNullOrEmpty(id)) return BadRequest("Hotspot ID is required");
            if(string.IsNullOrEmpty(hotspotUpdate.Id)) return BadRequest("Hotspot ID is required");

            if (id != hotspotUpdate.Id) return BadRequest("Hotspot ID mismatch");

            var hotspot = await _repository.GetHotspotByIdAsync(id);
            if (hotspot == null) return NotFound();

            hotspot.Type = hotspotUpdate.Type;
            hotspot.TargetRoomId = hotspotUpdate.TargetRoomId;
            hotspot.Label = hotspotUpdate.Label;
            hotspot.Description = hotspotUpdate.Description;
            hotspot.PosX = hotspotUpdate.PosX;
            hotspot.PosY = hotspotUpdate.PosY;
            hotspot.PosZ = hotspotUpdate.PosZ;

            await _repository.UpdateHotspotAsync(hotspot);
            return NoContent();
        }

        /// <summary>
        /// Delete a hotspot
        /// </summary>
        /// <param name="id">Hotspot ID</param>
        /// <returns>Updated hotspot</returns>
        [HttpDelete("hotspots/{id}")]
        public async Task<IActionResult> DeleteHotspot(string id)
        {
            //check id is not null or empty
            if(string.IsNullOrEmpty(id)) return BadRequest("Hotspot ID is required");

            //try delete hotspot
            try
            {
                //get hotspot by id
                var hotspot = await _repository.GetHotspotByIdAsync(id);
                if (hotspot == null) return NotFound();

                await _repository.DeleteHotspotAsync(id);
                return Ok(new { message = "Hotspot deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Delete hotspot failed", error = ex.Message });
            }
        }

        // ==========================================
        // FILE UPLOAD ENDPOINT
        // ==========================================

        /// <summary>
        /// Upload a file
        /// </summary>
        /// <param name="file">File object</param>
        /// <returns>File URL</returns>
        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            try
            {
                using (var stream = file.OpenReadStream())
                {
                    string relativePath = await _fileStorage.SaveFileAsync(stream, file.FileName);
                    return Ok(new { url = relativePath });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
