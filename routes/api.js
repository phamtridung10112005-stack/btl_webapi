import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { sachController } from "../controllers/sach.controller.js";
import { theloaiController } from "../controllers/theloai.controller.js";
import { sachtacgiaController } from "../controllers/sachtacgia.controller.js";

const router = Router();

// ----------------------- USERS -------------------------------------
router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.post("/users", userController.create);
router.put("/users/:id", userController.update);
router.delete("/users/:id", userController.delete);
// ----------------------- SACHS -------------------------------------
router.get("/sachs", sachController.getAll);
router.get("/sachs/:masach", sachController.getByMaSach);
router.post("/sachs", sachController.create);
router.put("/sachs/:masach", sachController.update);
router.delete("/sachs/:masach", sachController.delete);
// ----------------------- THELOAIS -------------------------------------
router.get("/theloais", theloaiController.getAll);
router.get("/theloais/:matheloai", theloaiController.getByMaTheLoai);
router.post("/theloais", theloaiController.create);
router.put("/theloais/:matheloai", theloaiController.update);
router.delete("/theloais/:matheloai", theloaiController.delete);
// ----------------------- SACHTACGIAS ------------------------------------
router.get("/sachtacgias", sachtacgiaController.getAll);
router.post("/sachtacgias", sachtacgiaController.create);
router.delete("/sachtacgias/masach=:masach&matacgia=:matacgia", sachtacgiaController.delete);

export default router;
