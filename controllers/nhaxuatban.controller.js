// File: nhaxuatban.controller.js
import { CreateNhaXuatBanDTO } from '../dtos/nhaxuatban/create-nhaxuatban.dto.js';
import { UpdateNhaXuatBanDTO } from '../dtos/nhaxuatban/update-nhaxuatban.dto.js';
import { nhaxuatbanService } from '../services/nhaxuatban.service.js';
import { validateCreateNhaXuatBan } from '../validators/nhaxuatban/create-nhaxuatban.validator.js';
import { validateUpdateNhaXuatBan } from '../validators/nhaxuatban/update-nhaxuatban.validator.js';
import { logger } from "../config/logger.js";
export const nhaxuatbanController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /nhaxuatbans');
      const nhaxuatbans = await nhaxuatbanService.getAllNhaXuatBans();
      res.json(nhaxuatbans);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
getByMaNXB: async (req, res) => {
    const manxb = req.params.manxb;
    logger.info(`Controller: GET /nhaxuatbans/${manxb}`);
    try {
      const nhaxuatban = await nhaxuatbanService.getNhaXuatBanByMaNXB(manxb);
      res.json(nhaxuatban);
    } catch (err) {
      logger.error(`Controller Error: getByMaNXB failed (${manxb})`, err);
      res.status(404).json({ message: err.message });
    }
  },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /nhaxuatbans');
      const validData = validateCreateNhaXuatBan(req.body);
      const dto = new CreateNhaXuatBanDTO(validData);
      const nhaxuatban = await nhaxuatbanService.createNhaXuatBan(dto);
      res.status(201).json(nhaxuatban);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
update: async (req, res) => {
    const manxb = req.params.manxb;
    logger.info(`Controller: PUT /nhaxuatbans/${manxb}`);
    try {
      const validData = validateUpdateNhaXuatBan(req.body);
      const dto = new UpdateNhaXuatBanDTO(validData);
      const nhaxuatban = await nhaxuatbanService.updateNhaXuatBan(manxb, dto);
      res.json(nhaxuatban);
    } catch (err) {
      logger.error(`Controller Error: update failed (${manxb})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const manxb = req.params.manxb;
    logger.info(`Controller: DELETE /nhaxuatbans/${manxb}`);
    try {
      const result = await nhaxuatbanService.deleteNhaXuatBan(manxb);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${manxb})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
