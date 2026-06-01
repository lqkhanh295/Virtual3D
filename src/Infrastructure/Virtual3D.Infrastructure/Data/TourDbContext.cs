using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using Virtual3D.Domain.Entities;

namespace Virtual3D.Infrastructure.Data
{
    public class TourDbContext : DbContext
    {
        public TourDbContext(DbContextOptions<TourDbContext> options) : base(options)
        {
        }

        public DbSet<Listing> Listings => Set<Listing>();
        public DbSet<Tour> Tours => Set<Tour>();
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<Hotspot> Hotspots => Set<Hotspot>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Listing.Amenities Value Converter
            modelBuilder.Entity<Listing>()
                .Property(l => l.Amenities)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            // Configure Listing -> Tour 1-to-1 relationship with cascade delete
            modelBuilder.Entity<Tour>()
                .HasOne(t => t.Listing)
                .WithOne()
                .HasForeignKey<Tour>(t => t.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Tour -> Room cascade delete
            modelBuilder.Entity<Room>()
                .HasOne(r => r.Tour)
                .WithMany(t => t.Rooms)
                .HasForeignKey(r => r.TourId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Room -> Hotspot cascade delete
            modelBuilder.Entity<Hotspot>()
                .HasOne(h => h.Room)
                .WithMany(r => r.Hotspots)
                .HasForeignKey(h => h.RoomId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
