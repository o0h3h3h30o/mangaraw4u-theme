/**
 * Route Configuration for Authentication
 * Defines public, private, and auth-only routes
 */

/**
 * Public routes - accessible to everyone (authenticated or not)
 */
export const publicRoutes = ["/", "/manga", "/genres", "/search"];

/**
 * Auth routes - only for unauthenticated users
 * Authenticated users will be redirected to home
 */
export const authRoutes = ["/login", "/register"];

/**
 * Protected routes - only for authenticated users
 * Unauthenticated users will be redirected to login
 */
export const protectedRoutes = ["/profile", "/library", "/settings"];

/**
 * Admin routes - only for users with admin role
 */
export const adminRoutes = ["/admin"];

/**
 * API auth prefix - routes that require authentication
 */
export const apiAuthPrefix = "/api/auth";

/**
 * Default redirect after login
 */
export const DEFAULT_LOGIN_REDIRECT = "/";

/**
 * Default redirect for unauthenticated users
 */
export const DEFAULT_UNAUTHENTICATED_REDIRECT = "/login";

/**
 * Check if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === pathname) return true;
    // Check for dynamic routes (e.g., /manga/[slug])
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Check if route is auth route (login/register)
 */
export function isAuthRoute(pathname: string): boolean {
  return authRoutes.includes(pathname);
}

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => {
    if (route === pathname) return true;
    // Check for dynamic routes
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

/**
 * Check if route is admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => {
    if (route === pathname) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}
