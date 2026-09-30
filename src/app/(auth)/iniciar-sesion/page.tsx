import { LoginForm } from "@/modules/auth/components/AuthForms";
import { firstSearchParam, type PageSearchParams } from "@/shared/lib/search-params";

export default async function LoginPage({ searchParams }: { searchParams: PageSearchParams }) {
  const sessionExpired = firstSearchParam((await searchParams).sesion) === "expirada";
  return <LoginForm sessionExpired={sessionExpired} />;
}
