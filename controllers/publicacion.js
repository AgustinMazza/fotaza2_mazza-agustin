import {
  Publicacion,
  Imagen,
  Etiqueta,
  PublicacionEtiqueta,
  Usuario,
  Comentario,
  Reaccion,
  Denuncia,
  MeInteresa,
} from "../models/index.js";
import { validador } from "../validaciones/publi.js";
import { aplicarMarcaAgua } from "../helpers/marcaAgua.js";
import { blobABase64 } from "../helpers/imagen.js";
import { crearNotificacion } from "../helpers/notificacion.js";

//Publicaciones
export const getPublicaciones = async (req, res) => {
  try {
    const usuarioId = req.session?.usuario?.id || null;

    const lista = await Publicacion.findAll({
      where: { activa: true },
      include: [
        {
          model: Imagen,
          as: "imagenes",
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

    res.render("publicaciones", {
      titulo: "Galería de Fotos",
      publicaciones,
      usuarioId,
    });
  } catch (error) {
    console.error("Error al traer las publicaciones:", error);
    res.status(500).send("Error interno del servidor");
  }
};

//publicaciones/crear
export const getCrearPublicacion = (req, res) => {
  res.render("crear-publicacion", {
    titulo: "Nueva Publicación",
    errores: [],
    datos: {},
  });
};

export const postCrearPublicacion = async (req, res) => {
  const validacion = validador.safeParse(req.body);
  if (!validacion.success) {
    const errores = validacion.error.errors.map((e) => e.message);
    return res.render("crear-publicacion", {
      titulo: "Nueva Publicación",
      errores,
      datos: req.body,
    });
  }

  const { titulo, descripcion, etiquetas, copyright, marca_agua } =
    validacion.data;
  const imagenesBase64 = req.body.imagenes
    ? Array.isArray(req.body.imagenes)
      ? req.body.imagenes
      : [req.body.imagenes]
    : [];

  try {
    const usuario_id = req.session?.usuario?.id;
    const nombre_usuario = req.session?.usuario?.nombre_usuario || "usuario";
    const descripcionFinal = descripcion?.trim() || null;

    const nuevaPublicacion = await Publicacion.create({
      titulo: titulo.trim(),
      descripcion: descripcionFinal,
      usuario_id,
    });

    const copyrightArray = Array.isArray(copyright) ? copyright : [copyright];
    const marcaArray = Array.isArray(marca_agua) ? marca_agua : [marca_agua];

    for (let i = 0; i < imagenesBase64.length; i++) {
      const [, datoPuro] = imagenesBase64[i].split(",");
      let buffer = Buffer.from(datoPuro, "base64");
      const tieneCopyright = copyrightArray[i] === "true";
      const textoMarca = marcaArray[i]?.trim() || "";

      if (tieneCopyright && textoMarca !== "") {
        try {
          buffer = await aplicarMarcaAgua(buffer, textoMarca);
        } catch (sharpErr) {
          console.error("Error al aplicar marca de agua:", sharpErr);
        }
      }

      await Imagen.create({
        direccion_foto: buffer,
        publicacion_id: nuevaPublicacion.id,
        copyright: tieneCopyright,
        marca_agua: textoMarca,
        bloqueada: false,
      });
    }

    const listaEtiquetas = etiquetas
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e !== "");
    for (const nombre of listaEtiquetas) {
      const [etiqueta] = await Etiqueta.findOrCreate({
        where: { nombre: nombre.toLowerCase() },
      });
      const yaExiste = await PublicacionEtiqueta.findOne({
        where: {
          publicacion_id: nuevaPublicacion.id,
          etiqueta_id: etiqueta.id,
        },
      });
      if (!yaExiste) {
        await PublicacionEtiqueta.create({
          publicacion_id: nuevaPublicacion.id,
          etiqueta_id: etiqueta.id,
        });
      }
    }

    res.redirect("/publicaciones");
  } catch (error) {
    console.error("Error al crear publicación:", error);
    res.render("crear-publicacion", {
      titulo: "Nueva Publicación",
      errores: ["Ocurrió un error al guardar. Intentá de nuevo."],
      datos: req.body,
    });
  }
};

//publicaciones/comentar
export const postComentar = async (req, res) => {
  try {
    const { publicacion_id, texto } = req.body;
    const pub = await Publicacion.findByPk(publicacion_id);
    if (!pub) return res.status(404).send("No encontrada");
    if (pub.comentarios_cerrados)
      return res.status(403).json({ error: "Comentarios cerrados" });

    const nuevo = await Comentario.create({
      texto: texto.trim(),
      publicacion_id: parseInt(publicacion_id),
      usuario_id: req.session.usuario.id,
      bloqueado: false,
    });

    await crearNotificacion({
      usuarioId: pub.usuario_id,
      origenId: req.session.usuario.id,
      tipo: "comentario",
    });

    res.json({
      id: nuevo.id,
      texto: nuevo.texto,
      nombre_usuario: req.session.usuario.nombre_usuario,
    });
  } catch (error) {
    console.error("Error al guardar comentario:", error);
    res.status(500).send("Error");
  }
};

//publicaciones/toggle-comentarios
export const postToggleComentarios = async (req, res) => {
  try {
    const { publicacion_id } = req.body;
    const pub = await Publicacion.findByPk(publicacion_id);
    if (!pub) return res.status(404).send("No encontrada");
    if (pub.usuario_id !== req.session.usuario.id)
      return res.status(403).send("Sin permiso");

    const nuevoEstado = !pub.comentarios_cerrados;
    await pub.update({ comentarios_cerrados: nuevoEstado });

    res.json({ cerrados: nuevoEstado });
  } catch (error) {
    console.error("Error al cambiar estado de comentarios:", error);
    res.status(500).send("Error");
  }
};

//publicaciones/votar
export const postVotar = async (req, res) => {
  try {
    const { imagen_id, estrellas } = req.body;
    const usuario_id = req.session.usuario.id;

    const imagen = await Imagen.findByPk(imagen_id, {
      include: [{ model: Publicacion }],
    });
    if (!imagen) return res.status(404).send("No encontrada");
    if (imagen.Publicacion.usuario_id === usuario_id)
      return res
        .status(403)
        .json({ error: "No podés votar tu propia publicación." });

    const existente = await Reaccion.findOne({
      where: { imagen_id: parseInt(imagen_id), usuario_id },
    });
    if (existente) {
      await existente.update({ estrellas: parseInt(estrellas) });
    } else {
      await Reaccion.create({
        imagen_id: parseInt(imagen_id),
        usuario_id,
        estrellas: parseInt(estrellas),
      });
    }

    const todas = await Reaccion.findAll({ where: { imagen_id } });
    const cantVotos = todas.length;
    const promedio = (
      todas.reduce((s, r) => s + r.estrellas, 0) / cantVotos
    ).toFixed(1);

    const pubDeLaImagen = await Publicacion.findByPk(imagen.publicacion_id);
    await crearNotificacion({
      usuarioId: pubDeLaImagen.usuario_id,
      origenId: req.session.usuario.id,
      tipo: "valoracion",
    });

    res.json({ ok: true, promedio, cantVotos });
  } catch (error) {
    console.error("Error al votar:", error);
    res.status(500).send("Error");
  }
};

//publicaciones/denunciar
export const postDenunciar = async (req, res) => {
  try {
    const { imagen_id, motivo, descripcion } = req.body;
    const usuario_id = req.session.usuario.id;
    if (!motivo)
      return res.status(400).json({ error: "El motivo es obligatorio." });

    const yaExiste = await Denuncia.findOne({
      where: { imagen_id: parseInt(imagen_id), usuario_id },
    });
    if (yaExiste)
      return res.status(409).json({ error: "Ya denunciaste esta imagen." });

    await Denuncia.create({
      imagen_id: parseInt(imagen_id),
      usuario_id,
      motivo,
      descripcion: descripcion?.trim() || null,
      estado: "pendiente",
    });

    const cant = await Denuncia.count({ where: { imagen_id } });
    if (cant > 3)
      await Imagen.update({ bloqueada: true }, { where: { id: imagen_id } });

    res.json({ ok: true });
  } catch (error) {
    console.error("Error al denunciar:", error);
    res.status(500).send("Error");
  }
};

//publicaciones/me-interesa
export const postMeInteresa = async (req, res) => {
  try {
    const { imagen_id } = req.body;
    const usuario_id = req.session.usuario.id;

    const imagen = await Imagen.findByPk(imagen_id, {
      include: [{ model: Publicacion, include: [{ model: Usuario }] }],
    });
    if (!imagen) return res.status(404).send("No encontrada");
    if (imagen.Publicacion.usuario_id === usuario_id)
      return res
        .status(403)
        .json({ error: "No podés marcar interés en tu propia foto." });

    const existente = await MeInteresa.findOne({
      where: { imagen_id: parseInt(imagen_id), usuario_id },
    });

    //si ya esta, lo sacamos (toggle)
    if (existente) {
      await existente.destroy();
      return res.json({ ok: true, activo: false });
    }

    //sino lo hacemos
    await MeInteresa.create({ imagen_id: parseInt(imagen_id), usuario_id });

    const autor = imagen.Publicacion.Usuario;
    await crearNotificacion({
      usuarioId: imagen.Publicacion.usuario_id,
      origenId: req.session.usuario.id,
      tipo: "me_interesa",
    });

    res.json({
      ok: true,
      activo: true,
      autorNombre: autor.nombre_usuario,
      autorMail: autor.mail,
    });
  } catch (error) {
    console.error("Error en me-interesa:", error);
    res.status(500).send("Error");
  }
};

//Post publicaciones/:id/editar
export const postEditarPublicacion = async (req, res) => {
  try {
    const pub = await Publicacion.findByPk(req.params.id);
    if (!pub) return res.status(404).json({ error: "No encontrada" });
    if (pub.usuario_id !== req.session.usuario.id)
      return res.status(403).json({ error: "Sin permiso" });

    if (req.body.soloVerificar) {
      const imagenes = await Imagen.findAll({
        where: { publicacion_id: pub.id },
        attributes: ["id"],
      });
      const imagenesIds = imagenes.map((i) => i.id);
      const tieneDenuncia =
        imagenesIds.length > 0
          ? await Denuncia.findOne({ where: { imagen_id: imagenesIds } })
          : null;
      if (tieneDenuncia)
        return res.status(403).json({
          error:
            "No podés editar esta publicación porque al menos una de sus imágenes tiene una denuncia.",
        });
      return res.json({ ok: true });
    }
    const imagenes = await Imagen.findAll({
      where: { publicacion_id: pub.id },
      attributes: ["id"],
    });
    const imagenesIds = imagenes.map((i) => i.id);
    const tieneDenuncia =
      imagenesIds.length > 0
        ? await Denuncia.findOne({ where: { imagen_id: imagenesIds } })
        : null;

    if (tieneDenuncia)
      return res.status(403).json({
        error:
          "No podés editar esta publicación porque al menos una de sus imágenes tiene una denuncia.",
      });

    const { titulo, descripcion, etiquetas } = req.body;
    if (!titulo || !titulo.trim())
      return res.status(400).json({ error: "El título es obligatorio." });

    await pub.update({
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || null,
    });

    await PublicacionEtiqueta.destroy({ where: { publicacion_id: pub.id } });
    const lista = (etiquetas || "")
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e !== "");
    for (const nombre of lista) {
      const [etiqueta] = await Etiqueta.findOrCreate({
        where: { nombre: nombre.toLowerCase() },
      });
      await PublicacionEtiqueta.create({
        publicacion_id: pub.id,
        etiqueta_id: etiqueta.id,
      });
    }

    const pubConEtiquetas = await Publicacion.findByPk(pub.id, {
      include: [{ model: Etiqueta }],
    });
    const etiquetasActualizadas = pubConEtiquetas.Etiqueta || [];
    
    res.json({
      ok: true,
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || "",
      etiquetas: etiquetasActualizadas.map((e) => ({
        id: e.id,
        nombre: e.nombre,
      })),
    });
  } catch (error) {
    console.error("Error al editar publicación:", error);
    res.status(500).json({ error: "Error interno" });
  }
};
