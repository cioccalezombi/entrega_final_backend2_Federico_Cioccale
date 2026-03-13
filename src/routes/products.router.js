import { Router } from "express";
import { ProductsController } from "../controllers/products.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Públicos
router.get("/", ProductsController.getAll);
router.get("/:pid", ProductsController.getById);

// Protegidos solo para "admin"
router.post("/", authorize("admin"), ProductsController.create);
router.put("/:pid", authorize("admin"), ProductsController.update);
router.delete("/:pid", authorize("admin"), ProductsController.delete);

export default router;
