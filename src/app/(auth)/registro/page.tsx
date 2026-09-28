import { RegisterForm } from "@/modules/auth/components/AuthForms";
import { ResendVerificationForm } from "@/modules/auth/components/ResendVerificationForm";

export default function RegisterPage() {
  return <div className="flex w-full flex-col items-center gap-6"><RegisterForm /><ResendVerificationForm /></div>;
}
