import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { hanghoaController } from "../controllers/hanghoa.controller.js";

const router = Router();

// ----------------------- USERS -------------------------------------
router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.post("/users", userController.create);
router.put("/users/:id", userController.update);
router.delete("/users/:id", userController.delete);

// ----------------------- HANGHOAS -------------------------------------
router.get("/hanghoas", hanghoaController.getAll);
router.get("/hanghoas/:MaLoai", hanghoaController.getByMaLoai);

export default router;
