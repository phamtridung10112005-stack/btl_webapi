import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { tacgiaController } from "../controllers/tacgia.controller.js";
import { nhaxuatbanController } from "../controllers/nhaxuatban.controller.js";
import { sachController } from "../controllers/sach.controller.js";
import { theloaiController } from "../controllers/theloai.controller.js";
import { sachtacgiaController } from "../controllers/sachtacgia.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/authens/auth.validator.js";
import { registerController, loginController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { POLICIES } from "../utils/constants/policies.js";
import { authorizePolicy } from "../middlewares/policy.middleware.js"

const router = Router();

// ----------------------- AUTH -------------------------------------
router.post("/auth/register", validate(registerSchema), registerController);
router.post("/auth/login", validate(loginSchema), loginController);

// ----------------------- USERS -------------------------------------
router.get("/users", authenticate, authorizePolicy(POLICIES.USER_VIEW_ALL), userController.getAll);
// router.get("/users/:email", authenticate, authorizePolicy(POLICIES.USER_VIEW_SELF), userController.getByEmail);
router.get("/users/:id", authenticate, authorizePolicy(POLICIES.USER_VIEW_SELF), userController.getById);
// router.post("/users", userController.create);
router.put("/users/:id", authenticate, authorizePolicy(POLICIES.USER_EDIT), userController.update);
router.delete("/users/:id", authenticate, authorizePolicy(POLICIES.USER_DELETE), userController.delete);

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
// router.get("/sachs", sachController.getAll);
router.get("/sachs", sachController.getSachPagingAndSorting);
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
