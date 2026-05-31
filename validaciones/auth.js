import { z } from "zod";

export const validador = z
  .object({
    nombre_usuario: z
      .string()
      .trim()
      .min(3, {
        message: "El nombre de usuario debe tener al menos 3 caracteres.",
      })
      .max(30, {
        message: "El nombre de usuario no puede superar los 30 caracteres.",
      }),

    mail: z
      .string()
      .trim()
      .email({ message: "Escribí un correo electrónico válido." }),

    contraseña: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),

    confirmar_contraseña: z.string(),
  })

  .refine((datos) => datos.contraseña === datos.confirmar_contraseña, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmar_contraseña"],
  });
