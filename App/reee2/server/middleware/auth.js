const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      // Return 401 so the client interceptor knows to attempt a token refresh
      return res.status(401).json({ message: "Token is not valid or expired" });
    }
    req.user = user;
    next();
  });
};

module.exports = { verifyToken };
