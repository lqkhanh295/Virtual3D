using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Virtual3D.Domain.Entities
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
}
