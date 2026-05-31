import { z } from "zod";

export const validador = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, { message: "El título es obligatorio." })
    .max(100, { message: "El título no puede superar los 100 caracteres." }),

  descripcion: z
    .string()
    .trim()
    .max(500, {
      message: "La descripción no puede superar los 500 caracteres.",
    })
    .optional()
    .or(z.literal("")),

  etiquetas: z.string().min(1, { message: "Agregá al menos una etiqueta." }),

  imagenes: z.any().refine(
    (val) => {
      if (!val) return false;
      if (Array.isArray(val)) return val.length > 0 && val[0] !== "";
      return val.trim() !== "";
    },
    { message: "Debés subir al menos una imagen." },
  ),
});
