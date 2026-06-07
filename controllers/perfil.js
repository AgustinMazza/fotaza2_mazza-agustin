import {
  Usuario,
  Publicacion,
  Imagen,
  Etiqueta,
  Comentario,
  Reaccion,
} from "../models/index.js";
import { blobABase64 } from "../helpers/imagen.js";

export const getPerfil = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id;
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ["id", "nombre_usuario", "foto_perfil", "descripcion"],
    });

    const lista = await Publicacion.findAll({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Imagen,
          as: "imagenes",
          include: [{ model: Reaccion }],
        },
        { model: Etiqueta },
        { model: Comentario },
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
          miVoto: null,
          yaDenuncio: false,
          yaMeInteresa: false,
        };
      });
      plain.Etiquetas = plain.Etiqueta || [];
      plain.comentariosCerrados = plain.comentarios_cerrados || false;
      plain.esAutor = true;
      return plain;
    });

    res.render("perfil", {
      titulo: "Mi Perfil",
      usuario: usuario.get({ plain: true }),
      publicaciones,
      usuarioId,
    });
  } catch (error) {
    console.error("Error al cargar el perfil:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const postActualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id;
    const { descripcion, foto_perfil } = req.body;
    const campos = { descripcion };
    if (foto_perfil && foto_perfil.trim() !== "") {
      campos.foto_perfil = foto_perfil;
    }
    await Usuario.update(campos, { where: { id: usuarioId } });
    const usuarioActualizado = await Usuario.findByPk(usuarioId);
    //recargo para que se vea la actualizacion
    req.session.usuario = usuarioActualizado.get({ plain: true });
    res.redirect("/perfil");
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).send("Error interno del servidor");
  }
};
