"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Card, Input, StatusBadge } from "@/shared/components";
import {
  type LoginFormValues,
  type RecoverPasswordFormValues,
  type RegisterFormValues,
  loginSchema,
  recoverPasswordSchema,
  registerSchema,
} from "@/modules/auth/schemas/auth-schemas";
import { authorizedDestinationForRole } from "@/modules/auth/login-destination";

async function csrf() {
  const response = await fetch("/api/session/csrf", { cache: "no-store" });
  const body = await response.json() as { csrfToken?: unknown };
  if (!response.ok || typeof body.csrfToken !== "string") throw new Error("csrf");
  return body.csrfToken;
}
function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">
      {children}
    </p>
  );
}

export function LoginForm({ sessionExpired = false }: { sessionExpired?: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "credentials" | "service">("idle");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  async function submit(values: LoginFormValues) {
    setStatus("idle");
    try {
      const csrfToken = await csrf();
      const response = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        const body = await response.json().catch(() => null) as {
          identity?: { role?: unknown };
        } | null;
        const requested = new URLSearchParams(window.location.search).get("next");
        router.replace(authorizedDestinationForRole(body?.identity?.role, requested));
        router.refresh();
        return;
      }
      setStatus(response.status === 401 ? "credentials" : "service");
    } catch {
      setStatus("service");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <StatusBadge tone="pistacho">Acceso seguro</StatusBadge>
      <h1 className="mt-5 text-2xl font-bold text-[#62727B]">Iniciar sesión</h1>
      {sessionExpired ? (
        <p className="mt-4 rounded-md bg-[#F8EDD2] px-4 py-3 text-sm font-semibold text-[#62727B]" role="alert">
          Tu sesión de personal expiró o fue cerrada. Inicia sesión nuevamente; los datos no guardados se perdieron.
        </p>
      ) : null}
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)}>
        <Input error={errors.email?.message} label="Correo electrónico" type="email" {...register("email")} />
        <Input error={errors.password?.message} label="Contraseña" type="password" {...register("password")} />
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
        </Button>
        {status === "credentials" ? (
          <p role="status">No pudimos validar el correo o la contraseña. Verifica también tu correo y permisos.</p>
        ) : null}
        {status === "service" ? <p role="status">El servicio no está disponible.</p> : null}
      </form>
      <div className="mt-6 flex flex-col gap-2 text-sm text-[#62727B]">
        <Link href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
        <Link href="/registro">Crear cuenta de paciente</Link>
      </div>
    </Card>
  );
}

export function RegisterForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "invalid" | "service">("idle");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    defaultValues: { confirmPassword: "", email: "", nombre: "", password: "" },
    resolver: zodResolver(registerSchema),
  });

  async function submit(values: RegisterFormValues) {
    setStatus("idle");
    try {
      const csrfToken = await csrf();
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ nombre: values.nombre, email: values.email, password: values.password }),
      });
      setStatus(response.ok ? "sent" : response.status === 400 ? "invalid" : "service");
    } catch {
      setStatus("service");
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <StatusBadge tone="pistacho">Cuenta de paciente</StatusBadge>
      <h1 className="mt-5 text-2xl font-bold text-[#62727B]">Registro</h1>
      <p className="mt-3 text-sm text-[#62727B]">Crea una identidad nueva. No se vinculará automáticamente con expedientes históricos.</p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)}>
        <Input error={errors.nombre?.message} label="Nombre completo" {...register("nombre")} />
        <Input error={errors.email?.message} label="Correo electrónico" type="email" {...register("email")} />
        <Input error={errors.password?.message} label="Contraseña" type="password" {...register("password")} />
        <Input error={errors.confirmPassword?.message} label="Confirmar contraseña" type="password" {...register("confirmPassword")} />
        <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Enviando…" : "Crear cuenta"}</Button>
        {status === "sent" ? <Notice>Solicitud recibida. Revisa tu correo para verificar la cuenta.</Notice> : null}
        {status === "invalid" ? <p role="status">Revisa los datos ingresados.</p> : null}
        {status === "service" ? <p role="status">El servicio no está disponible.</p> : null}
      </form>
    </Card>
  );
}

export function RecoverPasswordForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "invalid" | "service">("idle");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  async function submit(values: RecoverPasswordFormValues) {
    setStatus("idle");
    try {
      const csrfToken = await csrf();
      const response = await fetch("/api/account/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(values),
      });
      setStatus(response.ok ? "sent" : response.status === 400 ? "invalid" : "service");
    } catch {
      setStatus("service");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <StatusBadge tone="crema">Recuperación segura</StatusBadge>
      <h1 className="mt-5 text-2xl font-bold text-[#62727B]">Recuperar contraseña</h1>
      <p className="mt-3 text-sm text-[#62727B]">Si la cuenta existe y está verificada, recibirás un enlace de un solo uso.</p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)}>
        <Input error={errors.email?.message} label="Correo electrónico" type="email" {...register("email")} />
        <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Enviando…" : "Solicitar recuperación"}</Button>
        {status === "sent" ? <Notice>Solicitud recibida. Revisa tu correo si la cuenta es válida.</Notice> : null}
        {status === "invalid" ? <p role="status">Revisa el correo ingresado.</p> : null}
        {status === "service" ? <p role="status">El servicio no está disponible.</p> : null}
      </form>
    </Card>
  );
}
