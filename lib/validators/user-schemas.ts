/**
 * User Profile Validation Schemas
 * Zod schemas for validating user profile and account forms
 */

import { z } from "zod";

/**
 * Common validation rules
 */
const nameValidation = z
  .string()
  .min(2, "user.profile.nameMinChars")
  .max(50, "user.profile.nameMaxChars")
  .trim();

const emailValidation = z.string().email("user.profile.emailInvalid");

const passwordValidation = z
  .string()
  .min(6, "user.profile.passwordMinLength")
  .max(100, "user.profile.passwordMaxLength")
  .transform((val) => val.trim());

/**
 * Update Profile Schema
 * Validates name, email, and avatar changes (password has separate schema)
 */
export const updateProfileSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  avatar: z
    .instanceof(File, { message: "user.profile.avatarRequired" })
    .optional(),
});

/**
 * Change Password Schema
 * Validates password change with confirmation matching
 */
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "user.profile.currentPasswordRequired")
      .transform((val) => val.trim()),

    password: passwordValidation,

    password_confirmation: z
      .string()
      .min(1, "user.profile.passwordConfirmationRequired"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "user.profile.passwordMismatch",
    path: ["password_confirmation"], // Error appears on confirmation field
  });

/**
 * Avatar File Schema
 * Validates uploaded avatar file (size, type)
 *
 * Client enforces 5MB limit (more lenient)
 * API enforces 2MB limit (stricter)
 */
export const avatarFileSchema = z
  .instanceof(File, { message: "user.profile.fileRequired" })
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "user.profile.fileSizeExceeded"
  )
  .refine(
    (file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      ),
    "user.profile.fileTypeInvalid"
  );

/**
 * Type inference from schemas (optional, for TypeScript autocomplete)
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AvatarFileInput = z.infer<typeof avatarFileSchema>;
