export function requireAuth(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.redirect("/auth/login?alerta=true");
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.redirect("/auth/login");
  }
  if (!req.session.usuario.admin) {
    return res.status(403).render("error", { mensaje: "Acceso denegado." });
  }
  next();
}
