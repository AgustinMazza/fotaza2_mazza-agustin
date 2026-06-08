export const requireAdmin = (req, res, next) => {
  if (!req.session?.usuario?.admin) {
    return res.status(403).send("Acceso denegado.");
  }
  next();
};
