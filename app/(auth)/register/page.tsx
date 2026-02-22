import { RegisterForm } from "@/components/auth/register-form";
import { GuestOnly } from "@/components/auth/guest-only";

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  );
}
