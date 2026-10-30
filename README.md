# Virtual3D — 360° Apartment Virtual Tour & Spatial Viewer Platform

> An interactive, web-based 360° property inspection platform enabling prospective tenants and homebuyers to explore residential spaces with Google Street View-style camera transitions, 2D floorplan minimaps with real-time radar orientation, and in-scene tour authoring.

[![.NET 10](https://img.shields.io/badge/.NET-10.0%20%2F%208.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Web_API-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/apps/aspnet)
[![React](https://img.shields.io/badge/React-18.0+-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Onion-blueviolet?style=for-the-badge)](#system-architecture)
[![Entity Framework Core](https://img.shields.io/badge/EF_Core-SQLite%20%2F%20PostgreSQL-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://docs.microsoft.com/ef/core/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#license)

---

## 🌟 1. Key Features

### 🔄 1. Google Street View-Style 360° Transitions
- **Equirectangular Panorama Projection**: High-definition 360° spherical projection powered by Three.js `SphereGeometry` and customized shader materials.
- **Cinematic Zoom Tweening**: When navigating between rooms, the camera smoothly zooms in toward the clicked hotspot target, seamlessly cross-fades the equirectangular texture, and zooms out to the target room's default viewpoint.
- **Auto-Rotation**: Smooth ambient camera panning for passive viewing.

### 🧭 2. Dual Inspection Modes
- **Apartment Mode (Luxury & Multi-Room)**:
  - High-precision 2D vector SVG floorplan minimap.
  - **Dynamic Real-Time Radar Cone**: Interactive view frustum cone on the minimap that rotates in real-time in sync with the user's 3D camera azimuth.
  - Quick room-to-room teleportation by tapping rooms on the 2D floorplan.
- **Boarding Room / Studio Mode (Compact Rentals)**:
  - Streamlined UI focused on room utility costs (rent, electricity, water, internet) with scheduling inquiry buttons.
  - Vertical camera elevation transitions for loft and mezzanine spaces.

### 🛠️ 3. In-Scene Interactive Admin Portal
- **Zero-Code Tour Authoring**: Property owners can switch to Admin Mode directly inside the viewer.
- **Crosshair Target Hotspot Placement**: A precision targeting reticle allows administrators to click anywhere in the 3D spherical space to drop interactive hotspots.
- **Dual Hotspot Types**:
  - `Navigation Hotspot`: Links to another room with smooth transition animation.
  - `Information Hotspot`: Highlights furniture, appliances, specifications, and dimensions.
- Server-side image upload and instant scene graph updates.

### ⚡ 4. Instant Procedural Canvas Fallback
- Includes a procedural 3D texture generator built on HTML5 Canvas.
- When network connectivity is slow or assets are offline, procedural textures with directional compass indicators (**North, South, East, West**) render in **< 50ms**, ensuring sub-2-second first paint times.

---

## 🏗️ 2. System Architecture

Built strictly following **Clean Architecture (Onion Architecture)** principles to separate business logic, data persistence, and presentation:

```text
Virtual3D/
├── Virtual3D.slnx                   # Modern .NET XML Solution File
└── src/
    ├── Core/
    │   ├── Virtual3D.Domain/        # Enterprise domain models (Tour, Room, Hotspot, Enums)
    │   └── Virtual3D.Application/   # Service interfaces (ITourRepository, IFileStorageService) & DTOs
    ├── Infrastructure/
    │   └── Virtual3D.Infrastructure/# EF Core DbContext, SQLite/PostgreSQL migrations & file storage
    └── Presentation/
        └── Virtual3D.API/           # ASP.NET Core API endpoints & React SPA client in wwwroot
```

### Architectural Highlights
- **Framework-Independent Domain**: Enterprise business entities have zero dependencies on external frameworks or UI libraries.
- **Repository Pattern**: Persistence operations are abstracted behind `ITourRepository`, allowing seamless database switching.
- **Dual Database Provider**: Supports zero-configuration local development via SQLite and enterprise-grade deployment via PostgreSQL.

---

## 🛠️ 3. Tech Stack

- **Backend**: C#, .NET 10 / 8, ASP.NET Core Web API, Entity Framework Core
- **Frontend**: React.js, Three.js (WebGL), HTML5 Canvas, Tailwind CSS
- **Database**: SQLite (Local Dev / Embedded) & PostgreSQL (Production)
- **Tooling**: .NET CLI, Visual Studio, Vite, Postman

---

## 🚀 4. Quick Start & Local Execution

### Prerequisites
- [.NET 8 SDK or .NET 10 SDK](https://dotnet.microsoft.com/download)

### Run the Application

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lqkhanh295/Virtual3D.git
   cd Virtual3D
   ```

2. **Run the API & SPA directly:**
   ```bash
   dotnet run --project src/Presentation/Virtual3D.API
   ```

3. **Open the browser:**
   Navigate to `http://localhost:5048`.

> **Note:** On first startup, the application automatically creates the SQLite database (`virtual3d.db`) and seeds two complete virtual tours: a Luxury Penthouse and a Studio Loft.

---

## ⚙️ 5. Production Database Configuration (PostgreSQL)

To connect to a production PostgreSQL database:

1. Open `appsettings.json` (or set environment variables):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=Virtual3D_DB;Username=postgres;Password=your_password"
     },
     "DatabaseProvider": "PostgreSQL"
   }
   ```
2. Restart the API server. Entity Framework Core will automatically migrate the database schema and seed the initial tours.

---

## 📡 6. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tours` | Retrieve all available virtual tours |
| `GET` | `/api/tours/{id}` | Get tour details with full room hierarchy and hotspots |
| `POST` | `/api/tours` | Create a new virtual tour |
| `POST` | `/api/tours/{id}/rooms` | Add a new room with equirectangular panorama image |
| `POST` | `/api/rooms/{id}/hotspots` | Create navigation or informational hotspots |
| `DELETE` | `/api/hotspots/{id}` | Remove a hotspot |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Developed by [Le Quoc Khanh](https://github.com/lqkhanh295).
