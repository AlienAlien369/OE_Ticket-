# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files first (for layer caching of restore)
COPY ["src/OETicket.API/OETicket.API.csproj",                 "src/OETicket.API/"]
COPY ["src/OETicket.Application/OETicket.Application.csproj", "src/OETicket.Application/"]
COPY ["src/OETicket.Domain/OETicket.Domain.csproj",           "src/OETicket.Domain/"]
COPY ["src/OETicket.Infrastructure/OETicket.Infrastructure.csproj", "src/OETicket.Infrastructure/"]

RUN dotnet restore "src/OETicket.API/OETicket.API.csproj"

# Copy everything and build
COPY . .
RUN dotnet publish "src/OETicket.API/OETicket.API.csproj" \
    -c Release -o /app/publish

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY --from=build /app/publish .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "OETicket.API.dll"]
