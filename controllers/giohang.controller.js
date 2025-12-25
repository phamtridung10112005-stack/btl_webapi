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
getByMaGioHang: async (req, res) => {
    const magiohang = req.params.magiohang;
    logger.info(`Controller: GET /giohangs/${magiohang}`);
    try {
      const giohang = await giohangService.getGioHangByMaGioHang(magiohang);
      res.json(giohang);
    } catch (err) {
      logger.error(`Controller Error: getByMaGioHang failed (${magiohang})`, err);
      res.status(404).json({ message: err.message });
    }
  },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /giohangs');
      const validData = validateCreateGioHang(req.body);
      const dto = new CreateGioHangDTO(validData);
      const giohang = await giohangService.createGioHang(dto);
      res.status(201).json(giohang);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
update: async (req, res) => {
    const magiohang = req.params.magiohang;
    logger.info(`Controller: PUT /giohangs/${magiohang}`);
    try {
      const validData = validateUpdateGioHang(req.body);
      const dto = new UpdateGioHangDTO(validData);
      const giohang = await giohangService.updateGioHang(magiohang, dto);
      res.json(giohang);
    } catch (err) {
      logger.error(`Controller Error: update failed (${magiohang})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const magiohang = req.params.magiohang;
    logger.info(`Controller: DELETE /giohangs/${magiohang}`);
    try {
      const result = await giohangService.deleteGioHang(magiohang);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${magiohang})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
