import { Router } from "express";
import passport from "passport";
import { SessionsController } from "../controllers/sessions.controller.js";

const router = Router();

router.post("/register", SessionsController.register);

router.post("/login", passport.authenticate("login", { session: false }), SessionsController.login);

router.get("/current", passport.authenticate("current", { session: false }), SessionsController.current);

router.post("/forgot-password", SessionsController.forgotPassword);

router.post("/reset-password", SessionsController.resetPassword);

export default router;
