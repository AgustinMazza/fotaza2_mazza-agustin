import { Notificacion, Usuario } from "../models/index.js";

export const getNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id;

    const lista = await Notificacion.findAll({
      where: { usuario_id: usuarioId },
      include: [
        { model: Usuario, as: "origen", attributes: ["id", "nombre_usuario"] },
      ],
      order: [["fecha", "DESC"]],
    });

    res.render("notificaciones", {
      titulo: "Notificaciones",
      notificaciones: lista.map((n) => n.get({ plain: true })),
    });
  } catch (error) {
    console.error("Error al cargar notificaciones:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const postMarcarLeida = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id;
    const id = parseInt(req.params.id);

    await Notificacion.update(
      { leida: true },
      { where: { id, usuario_id: usuarioId } },
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({ error: "Error interno" });
  }
};
