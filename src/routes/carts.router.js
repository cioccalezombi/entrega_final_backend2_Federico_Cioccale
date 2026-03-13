import { Router } from "express";
import { CartsController } from "../controllers/carts.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:cid", CartsController.getById);

// Solo el usuario puede agregar productos a su carrito y finalizar compra
router.post("/:cid/products/:pid", authorize("user"), CartsController.addProduct);
router.post("/:cid/purchase", authorize("user"), CartsController.purchase);

export default router;
