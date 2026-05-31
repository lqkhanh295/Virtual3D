using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Virtual3D.Domain.Entities
{
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
