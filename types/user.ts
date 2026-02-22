/**
 * User-related Types
 * All types related to users, authentication, pets, and achievements
 */

/**
 * Pet entity
 */
export interface Pet {
  id: number;
  uuid: string;
  name: string;
  description: string;
  image: string;
  points: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Achievement entity
 */
export interface Achievement {
  id: number;
  uuid: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * User entity (complete profile)
 */
export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  avatar_full_url: string;
  total_points?: number; // Made optional to handle backend inconsistencies
  used_points?: number; // Made optional to handle backend inconsistencies
  available_points?: number; // Made optional to handle backend inconsistencies
  achievements_points?: number; // Made optional to handle backend inconsistencies
  limit_pet_points?: number;
  limit_achievement_points?: number;
  created_at: string;
  updated_at: string;
  pet?: Pet | null;
  achievement?: Achievement | null;
}

/**
 * Simplified user info (for nested objects)
 */
export interface UserBasic {
  id: number;
  uuid: string;
  name: string;
  avatar_full_url: string;
}

/**
 * Authentication response (login/register)
 */
export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Google OAuth data
 */
export interface GoogleAuthData {
  access_token: string;
}

/**
 * Profile update data
 */
export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  avatar?: File;
}

/**
 * Change password data (client-side form)
 * Note: Backend uses same endpoint as profile update
 */
export interface ChangePasswordData {
  current_password: string; // UX security: verify before change
  password: string; // New password (min 6 chars)
  password_confirmation: string; // Must match password
}

/**
 * User achievements response
 */
export interface UserAchievements {
  current_achievement: Achievement | null;
  unlocked_achievements: Achievement[];
  achievements_points: number;
  limit_achievement_points: number;
}

/**
 * User pets response
 */
export interface UserPets {
  current_pet: Pet | null;
  owned_pets: Pet[];
  total_points: number;
  used_points: number;
  available_points: number;
  limit_pet_points: number;
}
