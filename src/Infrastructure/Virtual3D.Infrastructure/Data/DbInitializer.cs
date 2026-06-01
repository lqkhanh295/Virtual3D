using System;
using System.Collections.Generic;
using System.Linq;
using Virtual3D.Domain.Entities;

namespace Virtual3D.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(TourDbContext context)
        {
            context.Database.EnsureCreated();

            if (!context.Tours.Any())
            {
                // ==========================================
                // 1. APARTMENT TOUR SEEDING
                // ==========================================
                var apartmentListing = new Listing
                {
                    Id = "listing_apartment_001",
                    ListingType = "apartment",
                    Name = "Luxury Smart Penthouse",
                    Address = "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
                    PricePerMonth = 18000000,
                    AreaSqm = 65.0,
                    BedroomCount = 2,
                    BathroomCount = 2,
                    Amenities = new List<string> { "hồ bơi", "gym", "bãi xe", "bảo vệ 24/7" },
                    Status = "available",
                    ContactPhone = "0907654321",
                    ContactZalo = "0907654321"
                };

                var apartmentTour = new Tour
                {
                    Id = "apartment_001",
                    ListingId = apartmentListing.Id,
                    DefaultRoomId = "living-room",
                    MinimapUrl = "/assets/floorplan.svg"
                };

                var livingRoom = new Room
                {
                    Id = "living-room",
                    TourId = apartmentTour.Id,
                    Name = "Phòng khách",
                    ImageUrl = "procedural://living-room",
                    PosX = 0f, PosY = 0f, PosZ = 0f,
                    MinimapX = 55.0,
                    MinimapY = 100.0
                };

                var kitchen = new Room
                {
                    Id = "kitchen",
                    TourId = apartmentTour.Id,
                    Name = "Bếp",
                    ImageUrl = "procedural://kitchen",
                    PosX = 15f, PosY = 0f, PosZ = 5f,
                    MinimapX = 110.0,
                    MinimapY = 65.0
                };

                var bedroom = new Room
                {
                    Id = "bedroom",
                    TourId = apartmentTour.Id,
                    Name = "Phòng ngủ",
                    ImageUrl = "procedural://bedroom",
                    PosX = 30f, PosY = 0f, PosZ = -10f,
                    MinimapX = 165.0,
                    MinimapY = 115.0
                };

                // Hotspots for Living Room
                livingRoom.Hotspots.AddRange(new[]
                {
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "navigation",
                        TargetRoomId = "kitchen",
                        Label = "Vào Bếp",
                        PosX = 12f, PosY = -1.5f, PosZ = 6f
                    },
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "info",
                        Label = "Sofa da nhập khẩu",
                        Description = "Sofa da thật nhập khẩu Ý, 3 chỗ ngồi rộng rãi, tình trạng mới 98%.",
                        PosX = -5f, PosY = -3f, PosZ = -12f
                    },
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "info",
                        Label = "Smart TV OLED",
                        Description = "TV LG OLED 65 inch độ phân giải 4K, hỗ trợ Apple AirPlay và âm thanh vòm Dolby Atmos.",
                        PosX = 1f, PosY = 0.5f, PosZ = -14f
                    }
                });

                // Hotspots for Kitchen
                kitchen.Hotspots.AddRange(new[]
                {
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "navigation",
                        TargetRoomId = "living-room",
                        Label = "Quay lại phòng khách",
                        PosX = -12f, PosY = -1.5f, PosZ = -6f
                    },
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "navigation",
                        TargetRoomId = "bedroom",
                        Label = "Đi vào Phòng ngủ",
                        PosX = 11f, PosY = -1f, PosZ = 8f
                    },
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "info",
                        Label = "Hệ thống Bếp từ Bosch",
                        Description = "Bếp từ 3 vùng nấu thương hiệu Bosch nhập khẩu Đức, có chế độ tự ngắt an toàn và khóa trẻ em.",
                        PosX = 3f, PosY = -2.5f, PosZ = -13f
                    }
                });

                // Hotspots for Bedroom
                bedroom.Hotspots.AddRange(new[]
                {
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "navigation",
                        TargetRoomId = "kitchen",
                        Label = "Quay lại nhà bếp",
                        PosX = -11f, PosY = -1.5f, PosZ = -8f
                    },
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "info",
                        Label = "Giường King Size",
                        Description = "Giường đệm lò xo túi cao cấp, ga gối lụa tự nhiên, tích hợp đèn ngủ LED và cổng sạc USB tại đầu giường.",
                        PosX = 2f, PosY = -3.5f, PosZ = 12f
                    }
                });

                // ==========================================
                // 2. BOARDING ROOM TOUR SEEDING
                // ==========================================
                var roomListing = new Listing
                {
                    Id = "listing_room_001",
                    ListingType = "room",
                    Name = "Phòng 101 — Dãy trọ Bình Thạnh",
                    Address = "12 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM",
                    PricePerMonth = 3500000,
                    AreaSqm = 22.0,
                    MaxOccupants = 2,
                    Amenities = new List<string> { "máy lạnh", "WC riêng", "bếp riêng", "nóng lạnh" },
                    Status = "available",
                    ContactPhone = "0901234567",
                    ContactZalo = "0901234567"
                };

                var roomTour = new Tour
                {
                    Id = "room_001",
                    ListingId = roomListing.Id,
                    DefaultRoomId = "room-ground",
                    MinimapUrl = string.Empty
                };

                var roomGround = new Room
                {
                    Id = "room-ground",
                    TourId = roomTour.Id,
                    Name = "Tầng trệt",
                    ImageUrl = "procedural://main-studio",
                    PosX = 0f, PosY = 0f, PosZ = 0f
                };

                var roomLoft = new Room
                {
                    Id = "room-loft",
                    TourId = roomTour.Id,
                    Name = "Gác lửng",
                    ImageUrl = "procedural://bedroom",
                    PosX = 0f, PosY = 10f, PosZ = 5f
                };

                // Hotspots for Ground Floor
                roomGround.Hotspots.AddRange(new[]
                {
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "info",
                        Label = "Máy lạnh Panasonic",
                        Description = "Máy điều hòa Panasonic Inverter 1.5 HP tiết kiệm điện, lắp đặt năm 2023.",
                        PosX = -11f, PosY = -2f, PosZ = -7f
                    },
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "navigation",
                        TargetRoomId = "room-loft",
                        Label = "Lên Gác Lửng",
                        PosX = 6f, PosY = 3.5f, PosZ = 9f
                    }
                });

                // Hotspots for Loft Mezzanine
                roomLoft.Hotspots.AddRange(new[]
                {
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "info",
                        Label = "Gác lửng ngủ tiện lợi",
                        Description = "Gác lửng bê tông kiên cố, lót sàn gỗ sạch sẽ, có lan can chắn an toàn.",
                        PosX = 5f, PosY = 1f, PosZ = 10f
                    },
                    new Hotspot
                    {
                        Id = Guid.NewGuid().ToString(),
                        Type = "navigation",
                        TargetRoomId = "room-ground",
                        Label = "Xuống Tầng Trệt",
                        PosX = -6f, PosY = -3.5f, PosZ = -9f
                    }
                });

                context.Listings.AddRange(apartmentListing, roomListing);
                context.Tours.AddRange(apartmentTour, roomTour);
                context.Rooms.AddRange(livingRoom, kitchen, bedroom, roomGround, roomLoft);
                context.SaveChanges();
            }
        }
    }
}
