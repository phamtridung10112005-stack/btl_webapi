// File: chitiethd.controller.js
import { CreateChiTietHDDTO } from '../dtos/chitiethd/create-chitiethd.dto.js';
import { UpdateChiTietHDDTO } from '../dtos/chitiethd/update-chitiethd.dto.js';
import { chitiethdService } from '../services/chitiethd.service.js';
import { validateCreateChiTietHD } from '../validators/chitiethd/create-chitiethd.validator.js';
import { validateUpdateChiTietHD } from '../validators/chitiethd/update-chitiethd.validator.js';
import { logger } from "../config/logger.js";

export const chitiethdController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /chitiethds');
      const chitiethds = await chitiethdService.getAllChiTietHDs();
      res.json(chitiethds);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  get: async (req, res) => {
    const {mahoadon, masach} = req.query;
    if (!mahoadon) {
        return res.status(400).json({ message: "mahoadon is required" });
    }
    if (masach) {
        logger.info(`Controller: GET /chitiethds?mahoadon=${mahoadon}&masach=${masach}`);
        try {
            const chitiethd = await chitiethdService.getChiTietHDByMaHoaDonAndMaSach(mahoadon, masach);
            res.json(chitiethd);
        } catch (err) {
            logger.error(`Controller Error: getByMaHoaDonAndMaSach failed (${mahoadon}, ${masach})`, err);
            res.status(404).json({ message: err.message });
        }
    } else {
        logger.info(`Controller: GET /chitiethds?mahoadon=${mahoadon}`);
    try {
      const chitiethd = await chitiethdService.getChiTietHDByMaHoaDon(mahoadon);
      res.json(chitiethd);
    } catch (err) {
      logger.error(`Controller Error: getByMaHoaDon failed (${mahoadon})`, err);
      res.status(404).json({ message: err.message });
    }
    }
  },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /chitiethds');
      const validData = validateCreateChiTietHD(req.body);
      const dto = new CreateChiTietHDDTO(validData);
      const chitiethd = await chitiethdService.createChiTietHD(dto);
      res.status(201).json(chitiethd);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
  update: async (req, res) => {
    const mahoadon = req.query.mahoadon;
    const masach = req.query.masach;
    logger.info(`Controller: PUT /chitiethds?mahoadon=${mahoadon}&masach=${masach}`);
    try {
      const validData = validateUpdateChiTietHD(req.body);
      const dto = new UpdateChiTietHDDTO(validData);
      const chitiethd = await chitiethdService.updateChiTietHDByMHDAndMS(mahoadon, masach, dto);
      res.json(chitiethd);
    } catch (err) {
      logger.error(`Controller Error: update failed (${mahoadon}, ${masach})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const {mahoadon, masach} = req.query;
    if (!mahoadon) {
        return res.status(400).json({ message: "mahoadon is required" });
    }
    if (masach) {
        logger.info(`Controller: DELETE /chitiethds?mahoadon=${mahoadon}&masach=${masach}`);
        try {
        const result = await chitiethdService.deleteChiTietHDByMHDAndMS(mahoadon, masach);
        res.json(result);
        } catch (err) {
        logger.error(`Controller Error: delete failed (${mahoadon}, ${masach})`, err);
        res.status(404).json({ message: err.message });
        }
    } else {
        logger.info(`Controller: DELETE /chitiethds?mahoadon=${mahoadon}`);
        try {
        const result = await chitiethdService.deleteChiTietHDByMHD(mahoadon);
        res.json(result);
        } catch (err) {
        logger.error(`Controller Error: delete failed (${mahoadon})`, err);
        res.status(404).json({ message: err.message });
        }
    }
  },
};
