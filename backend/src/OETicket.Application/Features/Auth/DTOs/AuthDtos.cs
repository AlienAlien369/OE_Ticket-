namespace OETicket.Application.Features.Auth.DTOs;

public sealed record LoginRequestDto(
    string UsernameOrEmail,
    string Password
);

public sealed record RegisterRequestDto(
    string Username,
    string Email,
    string Password,
    string FirstName,
    string LastName
);

public sealed record AuthResponseDto(
    string AccessToken,
    string Username,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyList<string> Roles,
    IReadOnlyList<string> AccessiblePages
);

public sealed record RefreshTokenRequestDto(
    string AccessToken
);
