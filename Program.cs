using Microsoft.EntityFrameworkCore;
using Virtual3D.Data;
using Virtual3D.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure EF Core context with flexible provider support (SQLite by default, PostgreSQL if configured)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var databaseProvider = builder.Configuration.GetValue<string>("DatabaseProvider");

if (databaseProvider?.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase) == true)
{
    builder.Services.AddDbContext<TourDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // SQLite local database is the zero-setup default
    var sqliteConn = connectionString ?? "Data Source=virtual3d.db";
    builder.Services.AddDbContext<TourDbContext>(options =>
        options.UseSqlite(sqliteConn));
}

// Configure CORS for local development testing
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors("AllowAll");
app.UseHttpsRedirection();

// Enable static file serving (for React frontend files in wwwroot and uploads)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

// Seed Default Tour Data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TourDbContext>();
    context.Database.EnsureCreated();

    if (!context.Tours.Any())
    {
        // 1. APARTMENT TOUR SEEDING
        var defaultTour = new Tour
        {
            Id = "apartment_001",
            Name = "Luxury Smart Penthouse",
            Description = "A premium 2-bedroom modern penthouse featuring glass facades, luxury Italian furniture, and panoramic views.",
            MinimapUrl = "/assets/floorplan.svg",
            Type = "apartment"
        };

        var livingRoom = new Room
        {
            Id = "living-room",
            TourId = defaultTour.Id,
            Name = "Living Room",
            ImageUrl = "procedural://living-room",
            PosX = 0f, PosY = 0f, PosZ = 0f
        };

        var kitchen = new Room
        {
            Id = "kitchen",
            TourId = defaultTour.Id,
            Name = "Kitchen & Dining",
            ImageUrl = "procedural://kitchen",
            PosX = 15f, PosY = 0f, PosZ = 5f
        };

        var bedroom = new Room
        {
            Id = "bedroom",
            TourId = defaultTour.Id,
            Name = "Master Bedroom",
            ImageUrl = "procedural://bedroom",
            PosX = 30f, PosY = 0f, PosZ = -10f
        };

        // Add Hotspots for Living Room
        livingRoom.Hotspots.AddRange(new[]
        {
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "navigation",
                TargetRoomId = "kitchen",
                Label = "Go to Kitchen",
                PosX = 12f, PosY = -1.5f, PosZ = 6f
            },
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "info",
                Label = "Luxury Leather Sofa",
                Description = "Italian premium top-grain leather 3-seater sofa. Modern design, supreme comfort, included in the monthly rent.",
                PosX = -5f, PosY = -3f, PosZ = -12f
            },
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "info",
                Label = "Smart Entertainment Hub",
                Description = "65\" LG OLED 4K Smart TV with Dolby Atmos soundbar. Mounted on an adjustable bracket.",
                PosX = 1f, PosY = 0.5f, PosZ = -14f
            }
        });

        // Add Hotspots for Kitchen
        kitchen.Hotspots.AddRange(new[]
        {
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "navigation",
                TargetRoomId = "living-room",
                Label = "Go to Living Room",
                PosX = -12f, PosY = -1.5f, PosZ = -6f
            },
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "navigation",
                TargetRoomId = "bedroom",
                Label = "Go to Bedroom",
                PosX = 11f, PosY = -1f, PosZ = 8f
            },
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "info",
                Label = "Induction Hob & Hood",
                Description = "Premium Bosch cooktop with child lock, power boost, and responsive auto-venting extractor hood.",
                PosX = 3f, PosY = -2.5f, PosZ = -13f
            }
        });

        // Add Hotspots for Bedroom
        bedroom.Hotspots.AddRange(new[]
        {
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "navigation",
                TargetRoomId = "kitchen",
                Label = "Go to Kitchen",
                PosX = -11f, PosY = -1.5f, PosZ = -8f
            },
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "info",
                Label = "King Size Bed",
                Description = "King-size memory foam mattress with hypoallergenic linens, integrated ambient headboard lighting, and dual USB charging outlets.",
                PosX = 2f, PosY = -3.5f, PosZ = 12f
            }
        });

        // 2. BOARDING ROOM TOUR SEEDING
        var boardingRoomTour = new Tour
        {
            Id = "room_001",
            Name = "Cosy Loft Studio",
            Description = "A modern fully-furnished studio boarding room featuring an integrated mezzanine loft sleeping area, private bath, and kitchenette.",
            MinimapUrl = "",
            Type = "boarding-room"
        };

        var mainStudio = new Room
        {
            Id = "main-studio",
            TourId = boardingRoomTour.Id,
            Name = "Main Living Space",
            ImageUrl = "procedural://main-studio",
            PosX = 0f, PosY = 0f, PosZ = 0f
        };

        var loftMezzanine = new Room
        {
            Id = "loft-mezzanine",
            TourId = boardingRoomTour.Id,
            Name = "Mezzanine Sleeping Loft",
            ImageUrl = "procedural://loft-mezzanine",
            PosX = 0f, PosY = 8f, PosZ = 4f
        };

        // Add Hotspots for Boarding Room main space
        mainStudio.Hotspots.AddRange(new[]
        {
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "navigation",
                TargetRoomId = "loft-mezzanine",
                Label = "Go up to Sleeping Loft",
                PosX = 1f, PosY = 4f, PosZ = 11f
            },
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "info",
                Label = "Compact Kitchenette",
                Description = "Includes dual zone induction hob, built-in microwave, under-counter quiet refrigerator, and ample storage cabinet space.",
                PosX = -11f, PosY = -2f, PosZ = -7f
            }
        });

        // Add Hotspots for Boarding Room Loft
        loftMezzanine.Hotspots.AddRange(new[]
        {
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "navigation",
                TargetRoomId = "main-studio",
                Label = "Go down to Main Room",
                PosX = -1f, PosY = -4f, PosZ = -11f
            },
            new Hotspot
            {
                Id = Guid.NewGuid().ToString(),
                Type = "info",
                Label = "Loft Safety Grid",
                Description = "Modern high-tensile steel security grid. Lets light and air pass through while providing maximum fall protection.",
                PosX = 0f, PosY = -1f, PosZ = 12f
            }
        });

        context.Tours.AddRange(defaultTour, boardingRoomTour);
        context.Rooms.AddRange(livingRoom, kitchen, bedroom, mainStudio, loftMezzanine);
        context.SaveChanges();
    }
}

// Fallback to serve index.html for SPA routes
app.MapFallbackToFile("index.html");

app.Run();

