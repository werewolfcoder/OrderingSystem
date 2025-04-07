const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'chef') {
      return res.status(403).json({ msg: "Access denied. Not a chef." });
    }

    req.chef = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(403).json({ msg: "Invalid or expired token." });
  }
};
