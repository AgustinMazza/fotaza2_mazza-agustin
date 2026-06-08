import { Notificacion } from "../models/index.js";

export const crearNotificacion = async ({
  usuarioId,
  origenId,
  tipo,
  mensaje,
}) => {
  if (usuarioId === origenId) return;

  await Notificacion.create({
    usuario_id: usuarioId,
    origen_id: origenId,
    tipo,
    mensaje,
  });
};
