namespace OETicket.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(string userId, string email, string username, IEnumerable<string> roles);
    string GenerateRefreshToken();
    (bool IsValid, string UserId, string Email) ValidateToken(string token);
}
