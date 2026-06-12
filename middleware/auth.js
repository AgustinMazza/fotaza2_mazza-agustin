export function requireAuth(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.redirect("/auth/login?alerta=true");
  }
  next();
}
