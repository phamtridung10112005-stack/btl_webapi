import { CreateSachTacGiaDTO } from '../dtos/sachtacgia/create-sachtacgia.dto.js';
import { UpdateSachTacGiaDTO } from '../dtos/sachtacgia/update-sachtacgia.dto.js';
import { sachtacgiaService } from '../services/sachtacgia.service.js';
import { validateCreateSachTacGia } from '../validators/sachtacgia/create-sachtacgia.validator.js';
import { validateUpdateSachTacGia } from '../validators/sachtacgia/update-sachtacgia.validator.js';
import { logger } from "../config/logger.js";

export const sachtacgiaController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /sachtacgias');
      const sachtacgias = await sachtacgiaService.getAllSachTacGias();
      res.json(sachtacgias);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /sachtacgias');
      const validData = validateCreateSachTacGia(req.body);
      const dto = new CreateSachTacGiaDTO(validData);
      const sachtacgia = await sachtacgiaService.createSachTacGia(dto);
      res.status(201).json(sachtacgia);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const masach = req.params.masach;
    const matacgia = req.params.matacgia;
    logger.info(`Controller: DELETE /sachtacgias/masach=${masach}&matacgia=${matacgia}`);
    try {
      const result = await sachtacgiaService.deleteSachTacGia(masach, matacgia);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${masach}, ${matacgia})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
