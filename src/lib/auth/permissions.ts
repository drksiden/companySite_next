export function hasPermission(
    userRole: string, 
    userPermissions: string[], 
    requiredPermission: string
  ): boolean {
    // Супер-админ имеет все права
    if (userPermissions.includes('*')) {
      return true;
    }
    
    // Проверяем конкретное право
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }
    
    // Проверяем права по роли (fallback)
    const rolePermissions = getRolePermissions(userRole);
    return rolePermissions.includes(requiredPermission) || rolePermissions.includes('*');
  }
  
  export function getRolePermissions(role: string): string[] {
    switch (role) {
      case 'super_admin':
        return ['*'];
      case 'admin':
        return [
          'products.*', 'categories.*', 'brands.*', 'collections.*',
          'attributes.*', 'inventory.*', 'analytics.view',
          'settings.view', 'settings.edit', 'import.products', 'export.products'
        ];
      case 'manager':
        return [
          'products.view', 'products.edit', 'products.create',
          'categories.view', 'brands.view', 'collections.view',
          'inventory.view', 'analytics.view'
        ];
      default:
        return [];
    }
  }