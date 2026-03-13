import { Router } from "express";
import { UsersController } from "../controllers/users.controller.js";

const router = Router();

router.post("/", UsersController.create);
router.get("/", UsersController.getAll);
router.get("/:uid", UsersController.getById);
router.put("/:uid", UsersController.update);
router.delete("/:uid", UsersController.delete);

export default router;
