import {
  Usuario,
  Publicacion,
  Imagen,
  Etiqueta,
  Comentario,
  Reaccion,
  Seguidor,
} from "../models/index.js";
import { blobABase64 } from "../helpers/imagen.js";
import { crearNotificacion } from "../helpers/notificacion.js";

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
        {
          model: Comentario,
          include: [{ model: Usuario, attributes: ["id", "nombre_usuario"] }],
        },
        { model: Usuario },
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
      plain.Comentarios = plain.Comentarios || plain.Comentario || [];
      return plain;
    });

    //contamos seguidores/seguidos/publicaciones
    const cantSeguidores = await Seguidor.count({
      where: { seguido_id: usuarioId },
    });
    const cantSeguidos = await Seguidor.count({
      where: { seguidor_id: usuarioId },
    });
    const cantPublicaciones = await Publicacion.count({
      where: { usuario_id: usuarioId, activa: true },
    });

    const seguidores = await Seguidor.findAll({
      where: { seguido_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "seguidor",
          attributes: ["id", "nombre_usuario", "foto_perfil"],
        },
      ],
    });

    const siguiendo = await Seguidor.findAll({
      where: { seguidor_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "seguido",
          attributes: ["id", "nombre_usuario", "foto_perfil"],
        },
      ],
    });

    res.render("perfil", {
      titulo: "Mi Perfil",
      usuario: usuario.get({ plain: true }),
      publicaciones,
      usuarioId,
      cantSeguidores,
      cantSeguidos,
      miPerfil: true,
      seguidores: seguidores.map((s) => s.seguidor),
      siguiendo: siguiendo.map((s) => s.seguido),
      cantPublicaciones,
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

export const postSeguir = async (req, res) => {
  try {
    const seguidorId = req.session?.usuario?.id;
    const seguidoId = parseInt(req.params.id);

    if (seguidorId === seguidoId) {
      return res.status(400).json({ error: "No podes seguirte a vos mismo" });
    }

    const yaExiste = await Seguidor.findOne({
      where: { seguidor_id: seguidorId, seguido_id: seguidoId },
    });
    if (yaExiste) {
      return res.status(400).json({ error: "Ya seguis a este usuario" });
    }

    await Seguidor.create({ seguidor_id: seguidorId, seguido_id: seguidoId });
    return res.json({ ok: true });
  } catch (error) {
    console.error("Error al seguir:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

export const postDejarDeSeguir = async (req, res) => {
  try {
    const seguidorId = req.session?.usuario?.id;
    const seguidoId = parseInt(req.params.id);

    await Seguidor.destroy({
      where: { seguidor_id: seguidorId, seguido_id: seguidoId },
    });

    await crearNotificacion({
      usuarioId: seguidoId,
      origenId: seguidorId,
      tipo: "seguidor",
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Error al dejar de seguir:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

export const getPerfilPublico = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id;
    const perfilId = parseInt(req.params.id);

    // Si es su propio perfil, redirigir a /perfil
    if (usuarioId === perfilId) return res.redirect("/perfil");

    const usuario = await Usuario.findByPk(perfilId, {
      attributes: ["id", "nombre_usuario", "foto_perfil", "descripcion"],
    });
    if (!usuario) return res.status(404).send("Usuario no encontrado");

    const lista = await Publicacion.findAll({
      where: { usuario_id: perfilId },
      include: [
        {
          model: Imagen,
          as: "imagenes",
          include: [{ model: Reaccion }],
        },
        { model: Etiqueta },
        {
          model: Comentario,
          include: [{ model: Usuario, attributes: ["id", "nombre_usuario"] }],
        },
        { model: Usuario },
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
      plain.esAutor = false;
      plain.Comentarios = plain.Comentarios || plain.Comentario || [];
      return plain;
    });

    const cantSeguidores = await Seguidor.count({
      where: { seguido_id: perfilId },
    });
    const cantSeguidos = await Seguidor.count({
      where: { seguidor_id: perfilId },
    });
    const yaLoSigo = !!(await Seguidor.findOne({
      where: { seguidor_id: usuarioId, seguido_id: perfilId },
    }));
    const cantPublicaciones = await Publicacion.count({
      where: { usuario_id: perfilId, activa: true },
    });

    res.render("perfil", {
      titulo: `Perfil de ${usuario.nombre_usuario}`,
      usuario: usuario.get({ plain: true }),
      publicaciones,
      usuarioId,
      cantSeguidores,
      cantSeguidos,
      yaLoSigo,
      miPerfil: false,
      cantPublicaciones,
    });
  } catch (error) {
    console.error("Error al cargar perfil público:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const getSeguidores = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id;

    const lista = await Seguidor.findAll({
      where: { seguido_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "seguidor",
          attributes: ["id", "nombre_usuario", "foto_perfil"],
        },
      ],
    });

    const seguidores = lista.map((s) => s.seguidor);

    res.render("seguidores", {
      titulo: "Mis seguidores",
      usuarios: seguidores,
      usuarioId,
    });
  } catch (error) {
    console.error("Error al cargar seguidores:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const getSiguiendo = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id;

    const lista = await Seguidor.findAll({
      where: { seguidor_id: usuarioId },
      include: [
        {
          model: Usuario,
          as: "seguido",
          attributes: ["id", "nombre_usuario", "foto_perfil"],
        },
      ],
    });

    const siguiendo = lista.map((s) => s.seguido);

    res.render("seguidores", {
      titulo: "Siguiendo",
      usuarios: siguiendo,
      usuarioId,
    });
  } catch (error) {
    console.error("Error al cargar siguiendo:", error);
    res.status(500).send("Error interno del servidor");
  }
};
