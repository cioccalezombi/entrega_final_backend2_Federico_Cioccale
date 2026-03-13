import passport from "passport";

/**
 * Middleware que verifica que el usuario tenga uno de los roles permitidos.
 * Usa la estrategia "current" de passport (JWT) para autenticar primero.
 * @param  {...string} roles - roles permitidos, ej: "admin", "user"
 */
export const authorize = (...roles) => {
  return [
    passport.authenticate("current", { session: false }),
    (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: "Acceso denegado: no tenés permisos para esta acción",
        });
      }
      next();
    },
  ];
};
