namespace OETicket.Application.Features.AccessControl.DTOs;

public sealed record PagePermissionDto(
    int Id,
    string RoleId,
    string RoleName,
    string PageKey,
    string PageDisplayName,
    bool IsEnabled,
    DateTime AssignedOn,
    string AssignedBy
);

public sealed record AssignPagePermissionDto(
    string RoleId,
    string PageKey,
    string PageDisplayName,
    bool IsEnabled
);

public sealed record PagePermissionMatrixDto(
    IReadOnlyList<string> AllRoles,
    IReadOnlyList<PageDefinitionDto> AllPages,
    IReadOnlyList<PagePermissionDto> Permissions
);

public sealed record PageDefinitionDto(
    string PageKey,
    string PageDisplayName,
    bool IsSuperAdminOnly
);
