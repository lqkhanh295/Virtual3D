using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Virtual3D.Models
{
    public class Tour
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string MinimapUrl { get; set; } = string.Empty;

        // "apartment" or "boarding-room"
        public string Type { get; set; } = "apartment";

        public List<Room> Rooms { get; set; } = new();
    }

    public class Room
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string TourId { get; set; } = string.Empty;

        [ForeignKey("TourId")]
        [JsonIgnore]
        public Tour? Tour { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        // Position coordinates in 3D scene (x, y, z)
        public float PosX { get; set; } = 0f;
        public float PosY { get; set; } = 0f;
        public float PosZ { get; set; } = 0f;

        public List<Hotspot> Hotspots { get; set; } = new();
    }

    public class Hotspot
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string RoomId { get; set; } = string.Empty;

        [ForeignKey("RoomId")]
        [JsonIgnore]
        public Room? Room { get; set; }

        [Required]
        // "navigation" or "info"
        public string Type { get; set; } = "navigation";

        // If type is "navigation", this points to the target Room's Id
        public string? TargetRoomId { get; set; }

        // If type is "info", this holds the visual label
        public string Label { get; set; } = string.Empty;

        // If type is "info", this holds the descriptive text
        public string Description { get; set; } = string.Empty;

        // Coordinates in local space of the sphere panorama
        public float PosX { get; set; }
        public float PosY { get; set; }
        public float PosZ { get; set; }
    }
}
