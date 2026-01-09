import { CreateGioHangDTO } from '../dtos/giohang/create-giohang.dto.js';
import { UpdateGioHangDTO } from '../dtos/giohang/update-giohang.dto.js';
import { giohangService } from '../services/giohang.service.js';
import { validateCreateGioHang } from '../validators/giohang/create-giohang.validator.js';
import { validateUpdateGioHang } from '../validators/giohang/update-giohang.validator.js';
import { logger } from "../config/logger.js";
export const giohangController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /giohangs');
      const giohangs = await giohangService.getAllGioHangs();
      res.json(giohangs);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
getByUserIDAndMaSach: async (req, res) => {
    const user_id = req.query.user_id;
    const masach = req.query.masach;
    logger.info(`Controller: GET /giohangs?${user_id}&${masach}`);
    try {
      const giohang = await giohangService.getGioHangByUserIDAndMaSach(user_id, masach);
      res.json(giohang);
    } catch (err) {
      logger.error(`Controller Error: getByMaGioHang failed user_id (${user_id} and masach ${masach})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  getByUserID:async (req, res) => {
    const user_id = req.query.user_id;
    logger.info(`Controller: GET /giohangs/user/?user_id=${user_id}`);
    try {
      const giohang = await giohangService.getGioHangByUserID(user_id);
      res.json(giohang);
    } catch (err) {
      logger.error(`Controller Error: getByMaGioHang failed user_id (${user_id})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  // getDetailsGioHangByUserID: async(req, res) => {
  //   const giohang = 
  // },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /giohangs');
      const validData = validateCreateGioHang(req.body);
      const dto = new CreateGioHangDTO(validData);
      console.log(`user_id ${dto.User_ID}, masach ${dto.MaSach}, soluong ${dto.SoLuong}`);
      const giohang = await giohangService.createGioHang(dto);
      res.status(201).json(giohang);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
update: async (req, res) => {
    const user_id = req.query.user_id;
    const masach = req.query.masach;
    logger.info(`Controller: PUT /giohangs?user_id=${user_id}&masach=${masach}`);
    try {
      const validData = validateUpdateGioHang(req.body);
      const dto = new UpdateGioHangDTO(validData);
      const giohang = await giohangService.updateGioHang(user_id, masach, dto);
      res.json(giohang);
    } catch (err) {
      logger.error(`Controller Error: update failed (user_id ${user_id} & masach ${masach})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const user_id = req.query.user_id;
    const masach = req.query.masach;
    logger.info(`Controller: DELETE /giohangs?user_id=${user_id}&masach=${masach}`);
    try {
      const result = await giohangService.deleteGioHang(user_id, masach);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (user_id ${user_id} & masach ${masach})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
