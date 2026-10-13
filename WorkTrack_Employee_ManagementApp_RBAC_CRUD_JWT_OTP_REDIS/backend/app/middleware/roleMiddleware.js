import roles from "../utils/roles.js";

const roleMiddleware = (permissions) => {
  return (req, res, next) => {
    // Create userRole variable which contains the role of the user
    const userRole = req.user.role;

    // Check if the role exists
    if (!roles[userRole]) {
      return res.status(403).json({ message: "Invalid Role" });
    }
    // Check permission
    const hasPermissions = permissions.some((permission) =>
      roles[userRole].includes(permission),
    );
    if (!hasPermissions) {
      return res.status(403).json({ message: "Permissions denied" });
    }
    next();
  };
};

export default roleMiddleware;
