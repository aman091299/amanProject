const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ sucess: false, message: "Token is not there" });
  }

  var decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  return decode;
};
const userAuth = async (req, res, next) => {
  try {
    var decode = await verifyToken(req, res);

    const user = await User.findById(decode._id);

    if (!user) {
      return res
        .status(401)
        .json({ sucess: false, message: "No user founded" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "auth fail" + error,
    });
  }
};

const adminAuth = async (req, res, next) => {
  var decode = await verifyToken(req, res);
  if (decode.role !== "admin") {
    return res
      .status(403)
      .json({ sucess: false, message: "Access denied: Admins only" });
  }

  const user = await User.findById(decode._id);

  if (!user) {
    return res.status(401).json({ sucess: false, message: "No user founded" });
  }
  req.user = user;
  next();
};

module.exports = { userAuth, adminAuth };
