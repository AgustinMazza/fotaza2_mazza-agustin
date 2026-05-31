import {
  Publicacion,
  Imagen,
  Etiqueta,
  PublicacionEtiqueta,
  Usuario,
} from "../models/index.js";
import { validador } from "../validaciones/publi.js";

export const getPublicaciones = async (req, res) => {
  try {
    const listaPublicaciones = await Publicacion.findAll({
      include: [{ model: Imagen }, { model: Usuario }, { model: Etiqueta }],
      order: [["fecha_creacion", "DESC"]],
    });

    res.render("publicaciones", {
      titulo: "Galería de Fotos",
      publicaciones: listaPublicaciones,
    });
  } catch (error) {
    console.error("Error al traer las publicaciones:", error);
    res.status(500).send("Error interno del servidor");
  }
};

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
    const errores = validacion.error.errors.map((err) => err.message);
    return res.render("crear-publicacion", {
      titulo: "Nueva Publicación",
      errores,
      datos: req.body,
    });
  }

  const { titulo, descripcion, etiquetas, copyright, marca_agua } =
    validacion.data;

  let imagenesBase64 = [];

  if (req.body.imagenes) {
    if (Array.isArray(req.body.imagenes)) {
      imagenesBase64 = req.body.imagenes;
    } else {
      //subio 1 sola foto
      imagenesBase64 = [req.body.imagenes];
    }
  }

  try {
    const usuario_id = req.session?.usuario?.id;
    let descripcionFinal = null;
    if (descripcion && descripcion.trim() !== "") {
      descripcionFinal = descripcion.trim();
    }

    const nuevaPublicacion = await Publicacion.create({
      titulo: titulo.trim(),
      descripcion: descripcionFinal,
      usuario_id,
    });

    let copyrightArray = [];
    if (Array.isArray(copyright)) {
      copyrightArray = copyright;
    } else {
      copyrightArray = [copyright];
    }

    let marcaArray = [];
    if (Array.isArray(marca_agua)) {
      marcaArray = marca_agua;
    } else {
      marcaArray = [marca_agua];
    }

    for (let i = 0; i < imagenesBase64.length; i++) {
      const base64String = imagenesBase64[i];

      const partes = base64String.split(",");
      const datoPuro = partes[1];

      const buffer = Buffer.from(datoPuro, "base64");

      let tieneCopyright = false;
      if (copyrightArray[i] === "true") {
        tieneCopyright = true;
      }

      let textoMarca = "";
      if (tieneCopyright === true) {
        if (marcaArray[i]) {
          textoMarca = marcaArray[i];
        }
      }

      await Imagen.create({
        direccion_foto: buffer,
        publicacion_id: nuevaPublicacion.id,
        copyright: tieneCopyright,
        marca_agua: textoMarca,
        cont_denuncias: 0,
        bloqueada: false,
      });
    }

    const listaEtiquetas = etiquetas
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e !== "");

    for (const nombreEtiqueta of listaEtiquetas) {
      const [etiqueta] = await Etiqueta.findOrCreate({
        where: { nombre: nombreEtiqueta.toLowerCase() },
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
