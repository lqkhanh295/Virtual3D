using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Virtual3D.Domain.Entities
{
    public class Tour
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ListingId { get; set; } = string.Empty;

        [ForeignKey("ListingId")]
        public Listing? Listing { get; set; }

        public string? DefaultRoomId { get; set; }

        public string? MinimapUrl { get; set; }

        public List<Room> Rooms { get; set; } = new();
    }
}
