import { CreateSachDTO } from '../dtos/sach/create-sach.dto.js';
import { UpdateSachDTO } from '../dtos/sach/update-sach.dto.js';
import { sachService } from '../services/sach.service.js';
import { validateCreateSach } from '../validators/sach/create-sach.validator.js';
import { validateUpdateSach } from '../validators/sach/update-sach.validator.js';
import { logger } from "../config/logger.js";

export const sachController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /sachs');
      const sachs = await sachService.getAllSachs();
      res.json(sachs);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMaSach: async (req, res) => {
    const masach = req.params.masach;
    logger.info(`Controller: GET /sachs/${masach}`);
    try {
      const sach = await sachService.getSachByMaSach(masach);
      res.json(sach);
    } catch (err) {
      logger.error(`Controller Error: getByMaSach failed`, err);
      res.status(404).json({ message: err.message });
    }
  },

  getSachPagingAndSorting: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const sortBy = req.query.sortBy || 'TenSach';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    try {
      const sachs = await sachService.getSachPagingAndSorting(page, size, sortBy, sortOrder);
      res.json(sachs);
    } catch (err) {
      logger.error("Controller Error: Paging failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      logger.info('Controller: POST /sachs');
      const validData = validateCreateSach(req.body);
      const dto = new CreateSachDTO(validData);
      const sach = await sachService.createSach(dto);
      res.status(201).json(sach);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const masach = req.params.masach;
    logger.info(`Controller: PUT /sachs/${masach}`);
    try {
      const validData = validateUpdateSach(req.body);
      const dto = new UpdateSachDTO(validData);
      const sach = await sachService.updateSach(masach, dto);
      res.json(sach);
    } catch (err) {
      logger.error(`Controller Error: update failed`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const masach = req.params.masach;
    logger.info(`Controller: DELETE /sachs/${masach}`);
    try {
      const result = await sachService.deleteSach(masach);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed`, err);
      res.status(404).json({ message: err.message });
    }
  },
};