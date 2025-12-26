import { CreateHoaDonDTO } from '../dtos/hoadon/create-hoadon.dto.js';
import { UpdateHoaDonDTO } from '../dtos/hoadon/update-hoadon.dto.js';
import { hoadonService } from '../services/hoadon.service.js';
import { validateCreateHoaDon } from '../validators/hoadon/create-hoadon.validator.js';
import { validateUpdateHoaDon } from '../validators/hoadon/update-hoadon.validator.js';
import { logger } from "../config/logger.js";

export const hoadonController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /hoadons');
      const hoadons = await hoadonService.getAllHoaDons();
      res.json(hoadons);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMaHoaDon: async (req, res) => {
    const mahoadon = req.params.mahoadon;
    logger.info(`Controller: GET /hoadons/${mahoadon}`);
    try {
      const hoadon = await hoadonService.getHoaDonByMaHoaDon(mahoadon);
      res.json(hoadon);
    } catch (err) {
      logger.error(`Controller Error: getByMaHoaDon failed (${mahoadon})`, err);
      res.status(404).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      logger.info('Controller: POST /hoadons');
      const validData = validateCreateHoaDon(req.body);
      const dto = new CreateHoaDonDTO(validData);
      const hoadon = await hoadonService.createHoaDon(dto);
      res.status(201).json(hoadon);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const mahoadon = req.params.mahoadon;
    logger.info(`Controller: PUT /hoadons/${mahoadon}`);
    try {
      const validData = validateUpdateHoaDon(req.body);
      // Lưu ý: Controller chỉ truyền dữ liệu update, Service sẽ lo phần merge
      const dto = new UpdateHoaDonDTO(validData);
      const hoadon = await hoadonService.updateHoaDon(mahoadon, dto);
      res.json(hoadon);
    } catch (err) {
      logger.error(`Controller Error: update failed (${mahoadon})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const mahoadon = req.params.mahoadon;
    logger.info(`Controller: DELETE /hoadons/${mahoadon}`);
    try {
      const result = await hoadonService.deleteHoaDon(mahoadon);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${mahoadon})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};