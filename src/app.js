import express from "express";
import apiRouter from "./routes/index.js";
import passport from "passport";
import { initializePassport } from "./config/passport.config.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
});

initializePassport();
app.use(passport.initialize());

export default app;
