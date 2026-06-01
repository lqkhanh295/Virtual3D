using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Virtual3D.Domain.Entities
{
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

        // Position coordinates on 2D floorplan minimap (0-100% percentage or pixels)
        public double? MinimapX { get; set; }
        public double? MinimapY { get; set; }

        public List<Hotspot> Hotspots { get; set; } = new();
    }
}
