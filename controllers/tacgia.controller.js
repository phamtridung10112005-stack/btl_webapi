// File: tacgia.controller.js
import { CreateTacGiaDTO } from '../dtos/tacgia/create-tacgia.dto.js';
import { UpdateTacGiaDTO } from '../dtos/tacgia/update-tacgia.dto.js';
import { tacgiaService } from '../services/tacgia.service.js';
import { validateCreateTacGia } from '../validators/tacgia/create-tacgia.validator.js';
import { validateUpdateTacGia } from '../validators/tacgia/update-tacgia.validator.js';
import { logger } from "../config/logger.js";
export const tacgiaController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /tacgias');
      const tacgias = await tacgiaService.getAllTacGias();
      res.json(tacgias);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
getByMaTacGia: async (req, res) => {
    const matacgia = req.params.matacgia;
    logger.info(`Controller: GET /tacgias/${matacgia}`);
    try {
      const tacgia = await tacgiaService.getTacGiaByMaTacGia(matacgia);
      res.json(tacgia);
    } catch (err) {
      logger.error(`Controller Error: getByMaTacGia failed (${matacgia})`, err);
      res.status(404).json({ message: err.message });
    }
  },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /tacgias');
      const validData = validateCreateTacGia(req.body);
      const dto = new CreateTacGiaDTO(validData);
      const tacgia = await tacgiaService.createTacGia(dto);
      res.status(201).json(tacgia);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
update: async (req, res) => {
    const matacgia = req.params.matacgia;
    logger.info(`Controller: PUT /tacgias/${matacgia}`);
    try {
      const validData = validateUpdateTacGia(req.body);
      const dto = new UpdateTacGiaDTO(validData);
      const tacgia = await tacgiaService.updateTacGia(matacgia, dto);
      res.json(tacgia);
    } catch (err) {
      logger.error(`Controller Error: update failed (${matacgia})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const matacgia = req.params.matacgia;
    logger.info(`Controller: DELETE /tacgias/${matacgia}`);
    try {
      const result = await tacgiaService.deleteTacGia(matacgia);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${matacgia})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
