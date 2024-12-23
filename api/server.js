import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/products.route.js";
import cartRoutes from "./routes/cart.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";

// middlewares
dotenv.config();
const app = express();
app.use(express.json()); // parse requests body
app.use(cookieParser()); // lets us to use cookie inside the project

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
// running the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`app started at port: ${PORT}`);
  connectDB();
});
