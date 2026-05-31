using Microsoft.EntityFrameworkCore;
using Virtual3D.Models;

namespace Virtual3D.Data
{
    public class TourDbContext : DbContext
    {
        public TourDbContext(DbContextOptions<TourDbContext> options) : base(options)
        {
        }

        public DbSet<Tour> Tours => Set<Tour>();
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<Hotspot> Hotspots => Set<Hotspot>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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
