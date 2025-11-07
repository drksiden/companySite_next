// src/lib/services/user.ts
// This service will now primarily interact with the backend API routes for user management.

// Re-defining types here for clarity based on schema provided earlier.
// For a larger project, consider moving these to a shared `src/lib/definitions.ts` or similar.
export type UserRole = 'admin' | 'moderator' | 'customer';
export type ClientType = 'individual' | 'legal_entity';

export interface UserProfile {
  id: string; // auth.users.id
  email: string; // This would typically come from auth.users, but stored in profile for convenience
  first_name: string | null; // Изменено: теперь может быть null
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  permissions?: string[] | null;
  company_id?: string | null;
  position?: string | null;
  address?: object | null; // jsonb type
  timezone?: string;
  locale?: string;
  last_login_at?: string | null;
  login_count?: number;
  is_active: boolean;
  client_type: ClientType; // ДОБАВЛЕНО: тип клиента
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  bin?: string | null;
  legal_address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  created_at: string;
  updated_at: string;
}

// User data for form submission (password only required on creation)
// Уточнено, чтобы явно включать поля, которые могут быть null, но обязательны в схеме
export type UserCreatePayload = {
  email: string;
  password: string; // Пароль обязателен при создании
  first_name: string | null; // Теперь может быть null
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  client_type: ClientType;
  company_id?: string | null;
  position?: string | null;
  permissions?: string[] | null; // Добавлено, если может быть в payload
  address?: object | null; // Добавлено, если может быть в payload
  timezone?: string; // Добавлено, если может быть в payload
  locale?: string; // Добавлено, если может быть в payload
};

// User data for update (all fields are partial/optional, исключая ID и email, которые не меняются здесь)
export type UserUpdatePayload = Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at' | 'last_login_at' | 'login_count'>>;


export const userService = {
  async listUserProfiles(): Promise<UserProfile[]> {
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' // Always re-fetch latest data for admin panel
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось получить список пользователей');
    }
    return response.json();
  },

  async getUserProfile(id: string): Promise<UserProfile | null> {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) {
        // If not found (404), return null, otherwise throw error
        if (response.status === 404) return null;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось получить профиль пользователя');
    }
    return response.json();
  },

  async listCompanies(): Promise<Company[]> {
    // For simplicity, fetching companies through an API route as well.
    // This allows for server-side control/caching of company data if needed.
    const response = await fetch('/api/admin/companies', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось получить список компаний');
    }
    return response.json();
  },


  // CRUD operations via API routes (secure server-side logic)

  async createUser(payload: UserCreatePayload): Promise<UserProfile> {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось создать пользователя');
    }
    return response.json();
  },

  async updateUserProfile(id: string, payload: UserUpdatePayload): Promise<UserProfile> {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH', // Using PATCH for partial updates
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось обновить пользователя');
    }
    return response.json();
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось удалить пользователя');
    }
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<UserProfile> {
    return this.updateUserProfile(userId, { role: newRole });
  },

  async updateUserActivity(userId: string, isActive: boolean): Promise<UserProfile> {
    return this.updateUserProfile(userId, { is_active: isActive });
  },

  async resetUserPassword(email: string): Promise<void> {
    const response = await fetch('/api/admin/users/reset-password', { // Assuming a dedicated route for password reset
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось отправить инструкцию по сбросу пароля');
    }
  },
};