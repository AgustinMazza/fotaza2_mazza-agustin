import bcrypt from "bcrypt";
import { Usuario } from "../models/index.js";
import { validador } from "../validaciones/auth.js";

export const getLogin = (req, res) => {
  if (req.session.usuario) return res.redirect("/");
  res.render("auth/login", {
    titulo: "Iniciar Sesión",
    error: null,
  });
};

export const postLogin = async (req, res) => {
  const { mail, contraseña } = req.body;

  if (!mail || !contraseña) {
    return res.render("auth/login", {
      titulo: "Iniciar Sesión",
      error: "Completá todos los campos.",
    });
  }

  try {
    const usuario = await Usuario.findOne({ where: { mail } });

    if (!usuario) {
      return res.render("auth/login", {
        titulo: "Iniciar Sesión",
        error: "El mail o la contraseña son incorrectos.",
      });
    }

    if (!usuario.estado) {
      return res.render("auth/login", {
        titulo: "Iniciar Sesión",
        error: "Tu cuenta está desactivada. Contactá al administrador.",
      });
    }

    const passwordOk = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!passwordOk) {
      return res.render("auth/login", {
        titulo: "Iniciar Sesión",
        error: "El mail o la contraseña son incorrectos.",
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      mail: usuario.mail,
      foto_perfil: usuario.foto_perfil,
      admin: usuario.admin,
    };

    res.redirect("/");
  } catch (error) {
    console.error("Error en login:", error);
    res.render("auth/login", {
      titulo: "Iniciar Sesión",
      error: "Error interno. Intentá de nuevo.",
    });
  }
};

export const getRegister = (req, res) => {
  if (req.session.usuario) return res.redirect("/");
  res.render("auth/register", {
    titulo: "Crear cuenta",
    errores: [],
    datos: {},
  });
};

export const postRegister = async (req, res) => {
  const validacion = validador.safeParse(req.body);
  if (!validacion.success) {
    const errores = validacion.error.issues.map((err) => err.message);
    return res.render("auth/register", {
      titulo: "Crear cuenta",
      errores: errores,
      datos: req.body,
    });
  }

  const { nombre_usuario, mail, contraseña } = validacion.data;

  try {
    const yaExiste = await Usuario.findOne({ where: { mail } });
    if (yaExiste) {
      return res.render("auth/register", {
        titulo: "Crear cuenta",
        errores: ["Ya existe una cuenta con ese mail."],
        datos: { nombre_usuario, mail },
      });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    await Usuario.create({
      nombre_usuario,
      mail,
      contraseña: hash,
      estado: true,
      admin: false,
    });

    res.redirect("/auth/login?registered=1");
  } catch (error) {
    console.error("Error en registro:", error);
    res.render("auth/register", {
      titulo: "Crear cuenta",
      errores: ["Error al crear la cuenta. Intentá de nuevo."],
      datos: req.body,
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
};
