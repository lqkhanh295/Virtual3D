using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Virtual3D.Domain.Entities
{
    public class Listing
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        // "room" or "apartment"
        public string ListingType { get; set; } = "room";

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public long PricePerMonth { get; set; }

        [Required]
        public double AreaSqm { get; set; }

        public int? MaxOccupants { get; set; } // Room only
        public int? BedroomCount { get; set; } // Apartment only
        public int? BathroomCount { get; set; } // Apartment only

        public List<string> Amenities { get; set; } = new();

        [Required]
        // "available" | "rented" | "negotiating"
        public string Status { get; set; } = "available";

        [Required]
        public string ContactPhone { get; set; } = string.Empty;

        public string ContactZalo { get; set; } = string.Empty;

        public string? Password { get; set; } // Optional password protection
    }
}
