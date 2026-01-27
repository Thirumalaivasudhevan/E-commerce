const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const verifyToken = async (req, res, next) => {
  let token;

  // Try to get token from httpOnly cookie first (preferred)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Fallback to Authorization header for backward compatibility
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "You are not authenticated! Please log in."
    });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token has been revoked. Please log in again."
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        // Return 401 so the client interceptor knows to attempt a token refresh
        return res.status(401).json({
          message: "Token is not valid or expired. Please log in again."
        });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

module.exports = { verifyToken };

