import { ResetPasswordForm } from "@/modules/auth/components/AuthForms";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await params;

  return <ResetPasswordForm />;
}
