import {
  Publicacion,
  Imagen,
  Etiqueta,
  Usuario,
  Comentario,
  Reaccion,
  Denuncia,
  MeInteresa,
} from "../models/index.js";
import { Op } from "sequelize";
import { blobABase64 } from "../helpers/imagen.js";

export const getIndex = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id || null;

    const lista = await Publicacion.findAll({
      where: { activa: true },
      include: [
        {
          model: Imagen,
          as: "imagenes",
          where: {
            bloqueada: false,
            copyright: false,
          },
          include: [
            { model: Reaccion },
            { model: Denuncia },
            { model: MeInteresa },
          ],
        },
        { model: Usuario },
        { model: Etiqueta },
        {
          model: Comentario,
          include: [{ model: Usuario, attributes: ["id", "nombre_usuario"] }],
        },
      ],
      order: [["fecha_creacion", "DESC"]],
    });

    const publicaciones = lista.map((pub) => {
      const plain = pub.get({ plain: true });

      plain.imagenes = (plain.imagenes || []).map((img) => {
        const reacciones = img.Reaccions || [];
        const cantVotos = reacciones.length;
        const promedio =
          cantVotos > 0
            ? (
                reacciones.reduce((s, r) => s + r.estrellas, 0) / cantVotos
              ).toFixed(1)
            : null;

        return {
          id: img.id,
          base64: blobABase64(img.direccion_foto),
          copyright: img.copyright,
          marca_agua: img.marca_agua,
          bloqueada: img.bloqueada,
          cantVotos,
          promedio,
          miVoto: usuarioId
            ? reacciones.find((r) => r.usuario_id === usuarioId)?.estrellas ||
              null
            : null,
          yaDenuncio: usuarioId
            ? (img.Denuncias || []).some((d) => d.usuario_id === usuarioId)
            : false,
          yaMeInteresa: usuarioId
            ? (img.MeInteresas || []).some((m) => m.usuario_id === usuarioId)
            : false,
        };
      });

      plain.comentariosCerrados = plain.comentarios_cerrados || false;
      plain.esAutor = usuarioId ? plain.usuario_id === usuarioId : false;
      plain.Etiquetas = plain.Etiqueta || [];
      return plain;
    });

    res.render("index", {
      titulo: "Inicio",
      publicaciones,
      usuarioId,
    });
  } catch (error) {
    console.error("Error al cargar el inicio:", error);
    res.status(500).send("Error interno del servidor");
  }
};
