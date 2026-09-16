import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo electrónico válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const registerSchema = z
  .object({
    nombre: z.string().trim().min(3, "Ingresa tu nombre completo."),
    email: z.string().trim().email("Ingresa un correo electrónico válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirma tu contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas deben coincidir.",
    path: ["confirmPassword"],
  });

export const recoverPasswordSchema = z.object({
  email: z.string().trim().email("Ingresa un correo electrónico válido."),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirma tu nueva contraseña."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas deben coincidir.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
