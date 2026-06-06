export function cargarUsuarioSesion(req, res, next) {
  res.locals.usuarioSesion = req.session.usuario || null;
  next();
}