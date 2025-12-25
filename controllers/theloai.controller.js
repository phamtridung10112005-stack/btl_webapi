// File: theloai.controller.js
import { CreateTheLoaiDTO } from '../dtos/theloai/create-theloai.dto.js';
import { UpdateTheLoaiDTO } from '../dtos/theloai/update-theloai.dto.js';
import { theloaiService } from '../services/theloai.service.js';
import { validateCreateTheLoai } from '../validators/theloai/create-theloai.validator.js';
import { validateUpdateTheLoai } from '../validators/theloai/update-theloai.validator.js';
import { logger } from "../config/logger.js";

export const theloaiController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /theloais');
      const theloais = await theloaiService.getAllTheLoais();
      res.json(theloais);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
getByMaTheLoai: async (req, res) => {
    const matheloai = req.params.matheloai;
    logger.info(`Controller: GET /theloais/${matheloai}`);
    try {
      const theloai = await theloaiService.getTheLoaiByMaTheLoai(matheloai);
      res.json(theloai);
    } catch (err) {
      logger.error(`Controller Error: getByMaTheLoai failed (${matheloai})`, err);
      res.status(404).json({ message: err.message });
    }
  },
create: async (req, res) => {
    try {
      logger.info('Controller: POST /theloais');
      const validData = validateCreateTheLoai(req.body);
      const dto = new CreateTheLoaiDTO(validData);
      const theloai = await theloaiService.createTheLoai(dto);
      res.status(201).json(theloai);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
update: async (req, res) => {
    const matheloai = req.params.matheloai;
    logger.info(`Controller: PUT /theloais/${matheloai}`);
    try {
      const validData = validateUpdateTheLoai(req.body);
      const dto = new UpdateTheLoaiDTO(validData);
      const theloai = await theloaiService.updateTheLoai(matheloai, dto);
      res.json(theloai);
    } catch (err) {
      logger.error(`Controller Error: update failed (${matheloai})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const matheloai = req.params.matheloai;
    logger.info(`Controller: DELETE /theloais/${matheloai}`);
    try {
      const result = await theloaiService.deleteTheLoai(matheloai);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${matheloai})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
