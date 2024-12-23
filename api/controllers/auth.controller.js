import User from "../models/user.module.js";
import jwt, { decode } from "jsonwebtoken";
import redis from "../lib/redis.js";
import bcrypt from "bcryptjs";
// generating 2 types of tokens
const generateTokens = (userId) => {
  const AccessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const RefreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { AccessToken, RefreshToken };
};

const storeRefreshToken = async (userId, RefreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    RefreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7days
};

const setCookies = (res, AccessToken, RefreshToken) => {
  res.cookie("accessToken", AccessToken, {
    sameSite: "strict", // prevent CSFR Attack
    httpOnly: true, // prevent XSS Attack
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", RefreshToken, {
    sameSite: "strict", // prevent CSFR Attack
    httpOnly: true, // prevent XSS Attack
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const sighnup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist)
      return res
        .status(400)
        .json({ message: "user already exist", data: null });
    const user = await User.create({ email, password, name });

    // authentication
    const { AccessToken, RefreshToken } = generateTokens(user._id); // generate
    await storeRefreshToken(user._id, RefreshToken); // store

    // saving them into cookies
    setCookies(res, AccessToken, RefreshToken);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("error in sighnup controller", error.message);

    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // comparing the password
    const comparePassword = bcrypt.compare(password, user.password);

    // check if user exit and if password was correct
    if (user && comparePassword) {
      const { AccessToken, RefreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, RefreshToken);
      setCookies(res, AccessToken, RefreshToken);

      res.status(200).json({
        _id: user._id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "invalid email or password" });
    }
  } catch (error) {
    console.log("error in login controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const RefreshToken = req.cookies.refreshToken;
    if (RefreshToken) {
      const decoded = jwt.verify(
        RefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("error in logout controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "no refresh token was awailable" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (refreshToken !== storedToken) {
      return res.status(401).json({ message: "invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "token refreshed succsesfully" });
  } catch (error) {
    console.log("error in refreshToken controller", error.message);
    res.status(401).json({ message: "server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  
};
