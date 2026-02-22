"use client";

/**
 * Auth Provider
 * Wraps the application to provide authentication context and token refresh
 */

import { ReactNode } from "react";
import { useTokenRefresh } from "@/lib/hooks/use-token-refresh";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that enables token refresh functionality
 *
 * This component should wrap your application (typically in the root layout)
 * to enable automatic token validation and refresh.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize token refresh mechanism
  useTokenRefresh();

  return <>{children}</>;
}
