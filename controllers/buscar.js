import { Op } from "sequelize";
import {
  Publicacion,
  Imagen,
  Usuario,
  Etiqueta,
  Comentario,
  Reaccion,
  Denuncia,
  MeInteresa,
} from "../models/index.js";
import { blobABase64 } from "../helpers/imagen.js";

export const getBuscar = async (req, res) => {
  const { texto, etiqueta, usuario, desde, hasta } = req.query;
  const usuarioId = req.session.usuario?.id || null;

  let publicaciones = [];
  let usuarios = [];

  try {
    if (texto || etiqueta || desde || hasta) {
      const wherePublicacion = { activa: true };

      if (desde || hasta) {
        wherePublicacion.fecha_creacion = {};
        if (desde) wherePublicacion.fecha_creacion[Op.gte] = new Date(desde);
        if (hasta) {
          const hastaFin = new Date(hasta);
          hastaFin.setHours(23, 59, 59, 999);
          wherePublicacion.fecha_creacion[Op.lte] = hastaFin;
        }
      }

      if (texto) {
        wherePublicacion[Op.or] = [
          { titulo: { [Op.like]: `%${texto}%` } },
          { descripcion: { [Op.like]: `%${texto}%` } },
        ];
      }

      const resultado = await Publicacion.findAll({
        where: wherePublicacion,
        include: [
          {
            model: Usuario,
            attributes: ["id", "nombre_usuario", "foto_perfil"],
          },
          {
            model: Etiqueta,
            through: { attributes: [] },
            ...(etiqueta
              ? { where: { nombre: { [Op.like]: `%${etiqueta}%` } } }
              : {}),
          },
          {
            model: Imagen,
            as: "imagenes",
            include: [
              { model: Reaccion },
              { model: Denuncia },
              { model: MeInteresa },
            ],
          },
          {
            model: Comentario,
            include: [{ model: Usuario, attributes: ["id", "nombre_usuario"] }],
          },
        ],
        order: [["fecha_creacion", "DESC"]],
      });

      publicaciones = resultado
        .filter((p) => p.imagenes && p.imagenes.length > 0)
        .map((p) => {
          const plain = p.get({ plain: true });

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
                ? reacciones.find((r) => r.usuario_id === usuarioId)
                    ?.estrellas || null
                : null,
              yaDenuncio: usuarioId
                ? (img.Denuncias || []).some((d) => d.usuario_id === usuarioId)
                : false,
              yaMeInteresa: usuarioId
                ? (img.MeInteresas || []).some(
                    (m) => m.usuario_id === usuarioId,
                  )
                : false,
            };
          });

          plain.Comentarios = plain.Comentarios || [];
          plain.comentariosCerrados = plain.comentarios_cerrados || false;
          plain.esAutor = usuarioId ? usuarioId === plain.usuario_id : false;
          plain.Etiquetas = plain.Etiqueta || [];
          return plain;
        });
    }

    if (usuario) {
      const resultado = await Usuario.findAll({
        where: {
          nombre_usuario: { [Op.like]: `%${usuario}%` },
          estado: true,
        },
        attributes: ["id", "nombre_usuario", "foto_perfil", "descripcion"],
      });
      usuarios = resultado.map((u) => u.get({ plain: true }));
    }

    res.render("buscar", {
      titulo: "Buscar",
      publicaciones,
      usuarios,
      usuarioId,
      query: {
        texto: texto || "",
        etiqueta: etiqueta || "",
        usuario: usuario || "",
        desde: desde || "",
        hasta: hasta || "",
      },
    });
  } catch (error) {
    console.error("Error en buscador:", error);
    res.status(500).send("Error interno: " + error.message);
  }
};
