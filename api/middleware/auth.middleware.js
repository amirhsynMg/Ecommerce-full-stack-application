import jwt from "jsonwebtoken";
import User from "../models/user.module.js";

export const protectRoute = async (req, res, next) => {
  try {
    // find the token
    const accessToken = req.cookies.accessToken;
    if (!accessToken)
      return res
        .status(401)
        .json({ Message: "unautherized no access Token privided" });
    try {
      // find the user
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return res.status(401).json({ Message: "no user found" });

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ Message: "unautherized Token Expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRout middleware", error.Message);
    res.status(401).json({ Message: "unauthorized - invalid access token" });
  }
};
export const adminRoute = async (req, res, next) => {
  // check if user is admin
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(401)
      .json({ Message: "invalid access user is not admin" });
  }
};
