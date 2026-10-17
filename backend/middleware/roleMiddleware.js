// ============================================================
// middleware/roleMiddleware.js - Role-Based Access Control (RBAC)
// ============================================================
// Restricts route access to specified user roles (e.g., 'hr', 'manager', 'employee').
// ============================================================

/**
 * Authorize specific roles to access a route
 * @param  {...string} roles - Allowed user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

authorize.authorize = authorize;
module.exports = authorize;
