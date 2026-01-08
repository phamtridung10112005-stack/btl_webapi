// File: giamgia.controller.js
import { CreateGiamGiaDTO } from '../dtos/giamgia/create-giamgia.dto.js';
import { UpdateGiamGiaDTO } from '../dtos/giamgia/update-giamgia.dto.js';
import { giamgiaService } from '../services/giamgia.service.js';
import { validateCreateGiamGia } from '../validators/giamgia/create-giamgia.validator.js';
import { validateUpdateGiamGia } from '../validators/giamgia/update-giamgia.validator.js';
import { logger } from "../config/logger.js";

export const giamgiaController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /giamgias');
      const giamgias = await giamgiaService.getAllGiamGias();
      res.json(giamgias);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
getByMaGiamGia: async (req, res) => {
    const magiamgia = req.params.magiamgia;
    logger.info(`Controller: GET /giamgias/${magiamgia}`);
    try {
      const giamgia = await giamgiaService.getGiamGiaByMaGiamGia(magiamgia);
      res.json(giamgia);
    } catch (err) {
      logger.error(`Controller Error: getByMaGiamGia failed (${magiamgia})`, err);
      res.status(404).json({ message: err.message });
    }
  },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /giamgias');
      const validData = validateCreateGiamGia(req.body);
      const dto = new CreateGiamGiaDTO(validData);
      const giamgia = await giamgiaService.createGiamGia(dto);
      res.status(201).json(giamgia);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
update: async (req, res) => {
    const magiamgia = req.params.magiamgia;
    logger.info(`Controller: PUT /giamgias/${magiamgia}`);
    try {
      const validData = validateUpdateGiamGia(req.body);
      const dto = new UpdateGiamGiaDTO(validData);
      const giamgia = await giamgiaService.updateGiamGia(magiamgia, dto);
      res.json(giamgia);
    } catch (err) {
      logger.error(`Controller Error: update failed (${magiamgia})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const magiamgia = req.params.magiamgia;
    logger.info(`Controller: DELETE /giamgias/${magiamgia}`);
    try {
      const result = await giamgiaService.deleteGiamGia(magiamgia);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${magiamgia})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
