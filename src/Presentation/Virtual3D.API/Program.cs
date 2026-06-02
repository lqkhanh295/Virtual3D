using Microsoft.EntityFrameworkCore;
using Virtual3D.Application.Interfaces;
using Virtual3D.Infrastructure.Data;
using Virtual3D.Infrastructure.Repositories;
using Virtual3D.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

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

// Register application interfaces with concrete infrastructure implementations
builder.Services.AddScoped<ITourRepository, TourRepository>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();

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

if(app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

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
    DbInitializer.Initialize(context);
}

// Fallback to serve index.html for SPA routes
app.MapFallbackToFile("index.html");

app.Run();
