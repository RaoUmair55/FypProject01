export const adminRoute = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admins only." });
    }
};

export const superAdminRoute = (req, res, next) => {
    if (req.user && req.user.role === "superadmin") {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Super Admins only." });
    }
};
