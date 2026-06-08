import { Publicacion, Imagen, Denuncia, Usuario } from "../models/index.js";
import { blobABase64 } from "../helpers/imagen.js";

export const getAdmin = async (req, res) => {
  try {
    //buscamos las que tengan imagen bloqueada
    const lista = await Publicacion.findAll({
      include: [
        {
          model: Imagen,
          as: "imagenes",
          where: { bloqueada: true },
          include: [
            {
              model: Denuncia,
              include: [
                { model: Usuario, attributes: ["id", "nombre_usuario"] },
              ],
            },
          ],
        },
        { model: Usuario, attributes: ["id", "nombre_usuario"] },
      ],
    });

    const publicaciones = lista.map((pub) => {
      const plain = pub.get({ plain: true });
      plain.imagenes = (plain.imagenes || []).map((img) => ({
        ...img,
        base64: blobABase64(img.direccion_foto),
      }));
      return plain;
    });

    res.render("admin", {
      titulo: "Panel de moderación",
      publicaciones,
    });
  } catch (error) {
    console.error("Error en panel admin:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const postDarDeBaja = async (req, res) => {
  try {
    const pubId = parseInt(req.params.id);
    const pub = await Publicacion.findByPk(pubId, {
      include: [{ model: Usuario }],
    });
    if (!pub) return res.status(404).send("No encontrada");

    await pub.update({ activa: false });

    const cantBajas = await Publicacion.count({
      where: { usuario_id: pub.usuario_id, activa: false },
    });

    if (cantBajas >= 3) {
      await Usuario.update(
        { estado: false },
        { where: { id: pub.usuario_id } },
      );
    }

    res.redirect("/admin");
  } catch (error) {
    console.error("Error al dar de baja:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const postDesestimar = async (req, res) => {
  try {
    const imgId = parseInt(req.params.id);

    await Denuncia.destroy({ where: { imagen_id: imgId } });
    await Imagen.update({ bloqueada: false }, { where: { id: imgId } });

    res.redirect("/admin");
  } catch (error) {
    console.error("Error al desestimar:", error);
    res.status(500).send("Error interno del servidor");
  }
};
