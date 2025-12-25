import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { tacgiaController } from "../controllers/tacgia.controller.js";
import { nhaxuatbanController } from "../controllers/nhaxuatban.controller.js";
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
//------------------tác giả--------------------------------
router.get("/tacgias", tacgiaController.getAll);
router.get("/tacgias/:matacgia", tacgiaController.getByMaTacGia);
router.post("/tacgias", tacgiaController.create);
router.put("/tacgias/:matacgia", tacgiaController.update);
router.delete("/tacgias/:matacgia", tacgiaController.delete);
 //------------------nhà xuất bản------------------------------
router.get("/nhaxuatbans", nhaxuatbanController.getAll);
router.get("/nhaxuatbans/:manxb", nhaxuatbanController.getByMaNXB);
router.post("/nhaxuatbans", nhaxuatbanController.create);
router.put("/nhaxuatbans/:manxb", nhaxuatbanController.update);
router.delete("/nhaxuatbans/:manxb", nhaxuatbanController.delete);
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
router.get("/sachtacgias/all", sachtacgiaController.getAll);
router.post("/sachtacgias", sachtacgiaController.create);
router.delete("/sachtacgias", sachtacgiaController.delete);
export default router;
