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
  type ResetPasswordFormValues,
  loginSchema,
  recoverPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/modules/auth/schemas/auth-schemas";

function SimulatedResponse({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md bg-[#E5F1D8] px-4 py-3 text-sm font-semibold text-[#62727B]" role="status">
      {children}
    </p>
  );
}

export function LoginForm() {
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

  async function onSubmit(values: LoginFormValues) {
    setStatus("idle");
    try {
      const csrfResponse = await fetch("/api/session/csrf", { cache: "no-store" });
      const csrfBody = await csrfResponse.json() as { csrfToken?: unknown };
      if (!csrfResponse.ok || typeof csrfBody.csrfToken !== "string") {
        setStatus("service");
        return;
      }
      const response = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfBody.csrfToken },
        body: JSON.stringify(values),
      });
      if (response.ok) { router.replace("/paciente"); router.refresh(); return; }
      setStatus(response.status === 401 ? "credentials" : "service");
    } catch { setStatus("service"); }
  }

  return (
    <Card className="w-full max-w-md">
      <StatusBadge tone="pistacho">Acceso de paciente</StatusBadge>
      <h1 className="mt-5 text-2xl font-bold text-[#62727B]">Iniciar sesión</h1>
      <p className="mt-3 text-sm leading-6 text-[#62727B]/80">
        Ingresa con tu cuenta de paciente. La sesión se verifica antes de abrir el portal y las credenciales no se almacenan en el navegador.
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          error={errors.email?.message}
          label="Correo electrónico"
          type="email"
          {...register("email")}
        />
        <Input
          error={errors.password?.message}
          label="Contraseña"
          type="password"
          {...register("password")}
        />
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Verificando…" : "Iniciar sesión"}
        </Button>
        {status === "credentials" ? (
          <p className="rounded-md bg-[#F8EDD2] px-4 py-3 text-sm font-semibold leading-6 text-[#62727B]" role="status">
            No pudimos validar el correo o la contraseña. Revisa los datos e inténtalo de nuevo.
          </p>
        ) : null}
        {status === "service" ? <p className="rounded-md bg-[#F8E2E8] px-4 py-3 text-sm font-semibold leading-6 text-[#62727B]" role="status">El servicio no está disponible en este momento. No se inició sesión.</p> : null}
      </form>
      <div className="mt-6 flex flex-col gap-2 text-sm text-[#62727B]">
        <Link className="font-semibold hover:underline" href="/recuperar-contrasena">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link className="font-semibold hover:underline" href="/registro">
          Crear cuenta visual
        </Link>
      </div>
    </Card>
  );
}

export function RegisterForm() {
  const [message, setMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      nombre: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });

  function onSubmit() {
    setMessage(
      "Registro validado visualmente. No se creó usuario ni se almacenó contraseña.",
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <StatusBadge tone="pistacho">Cuenta simulada</StatusBadge>
      <h1 className="mt-5 text-2xl font-bold text-[#62727B]">Registro</h1>
      <p className="mt-3 text-sm leading-6 text-[#62727B]/80">
        Representa el alta futura de usuarios sin conectarse a backend.
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input error={errors.nombre?.message} label="Nombre completo" type="text" {...register("nombre")} />
        <Input error={errors.email?.message} label="Correo electrónico" type="email" {...register("email")} />
        <Input error={errors.password?.message} label="Contraseña" type="password" {...register("password")} />
        <Input
          error={errors.confirmPassword?.message}
          label="Confirmar contraseña"
          type="password"
          {...register("confirmPassword")}
        />
        <Button disabled={isSubmitting} type="submit">
          Validar registro visual
        </Button>
        {message ? <SimulatedResponse>{message}</SimulatedResponse> : null}
      </form>
      <p className="mt-6 text-sm text-[#62727B]">
        ¿Ya tienes cuenta visual?{" "}
        <Link className="font-semibold hover:underline" href="/iniciar-sesion">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}

export function RecoverPasswordForm() {
  const [message, setMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RecoverPasswordFormValues>({
    defaultValues: { email: "" },
    resolver: zodResolver(recoverPasswordSchema),
  });

  function onSubmit() {
    setMessage(
      "Solicitud visual preparada. No se envió correo real ni se generó token.",
    );
  }

  return (
    <Card className="w-full max-w-md">
      <StatusBadge tone="crema">Recuperación visual</StatusBadge>
      <h1 className="mt-5 text-2xl font-bold text-[#62727B]">Recuperar contraseña</h1>
      <p className="mt-3 text-sm leading-6 text-[#62727B]/80">
        Captura de correo para simular el inicio del flujo de recuperación.
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          error={errors.email?.message}
          label="Correo electrónico"
          type="email"
          {...register("email")}
        />
        <Button disabled={isSubmitting} type="submit">
          Preparar recuperación visual
        </Button>
        {message ? <SimulatedResponse>{message}</SimulatedResponse> : null}
      </form>
      <Link className="mt-6 block text-sm font-semibold text-[#62727B] hover:underline" href="/iniciar-sesion">
        Volver a iniciar sesión
      </Link>
    </Card>
  );
}

export function ResetPasswordForm() {
  const [message, setMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { confirmPassword: "", password: "" },
    resolver: zodResolver(resetPasswordSchema),
  });

  function onSubmit() {
    setMessage(
      "Nueva contraseña validada visualmente. No se actualizó ningún registro real.",
    );
  }

  return (
    <Card className="w-full max-w-md">
      <StatusBadge tone="rosa">Restablecimiento visual</StatusBadge>
      <h1 className="mt-5 text-2xl font-bold text-[#62727B]">Restablecer contraseña</h1>
      <p className="mt-3 text-sm leading-6 text-[#62727B]/80">
        Flujo simulado para validar contraseña nueva sin consumir tokens reales.
      </p>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Input
          error={errors.password?.message}
          label="Nueva contraseña"
          type="password"
          {...register("password")}
        />
        <Input
          error={errors.confirmPassword?.message}
          label="Confirmar nueva contraseña"
          type="password"
          {...register("confirmPassword")}
        />
        <Button disabled={isSubmitting} type="submit">
          Validar restablecimiento visual
        </Button>
        {message ? <SimulatedResponse>{message}</SimulatedResponse> : null}
      </form>
    </Card>
  );
}
