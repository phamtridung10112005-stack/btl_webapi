// File: sachyeuthich.controller.js
import { CreateSachYeuThichDTO } from '../dtos/sachyeuthich/create-sachyeuthich.dto.js';
import { UpdateSachYeuThichDTO } from '../dtos/sachyeuthich/update-sachyeuthich.dto.js';
import { sachyeuthichService } from '../services/sachyeuthich.service.js';
import { validateCreateSachYeuThich } from '../validators/sachyeuthich/create-sachyeuthich.validator.js';
import { validateUpdateSachYeuThich } from '../validators/sachyeuthich/update-sachyeuthich.validator.js';
import { logger } from "../config/logger.js";

export const sachyeuthichController = {
  getAll: async (req, res) => {
    try {
      logger.info('Controller: GET /sachyeuthichs');
      const sachyeuthichs = await sachyeuthichService.getAllSachYeuThichs();
      res.json(sachyeuthichs);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },
getByUser_ID: async (req, res) => {
    const user_id = req.params.user_id;
    logger.info(`Controller: GET /sachyeuthichs/${user_id}`);
    try {
      const sachyeuthichs = await sachyeuthichService.getSachYeuThichByUser_ID(user_id);
      res.json(sachyeuthichs);
    } catch (err) {
      logger.error(`Controller Error: getByUser_ID failed (${user_id})`, err);
      res.status(404).json({ message: err.message });
    }
  },
getByMaSach: async (req, res) => {
    const masach = req.params.masach;
    logger.info(`Controller: GET /sachyeuthichs/${masach}`);
    try {
      const sachyeuthichs = await sachyeuthichService.getSachYeuThichByMaSach(masach);
      res.json(sachyeuthichs);
    } catch (err) {
      logger.error(`Controller Error: getByMaSach failed (${masach})`, err);
      res.status(404).json({ message: err.message });
    }
},
getByUser_ID_AND_MaSach: async (req, res) => {
    const user_id = req.query.user_id;
    const masach = req.query.masach;
    logger.info(`Controller: GET /sachyeuthichs/${user_id}/${masach}`);
    try {
      const sachyeuthich = await sachyeuthichService.getSachYeuThichByUser_ID_AND_MaSach(user_id, masach);
      res.json(sachyeuthich);
    } catch (err) {
      logger.error(`Controller Error: getByUser_ID_AND_MaSach failed (${user_id}, ${masach})`, err);
      res.status(404).json({ message: err.message });
    }
},
create: async (req, res) => {
    try {
      logger.info('Controller: POST /sachyeuthichs');
      const validData = validateCreateSachYeuThich(req.body);
      const dto = new CreateSachYeuThichDTO(validData);
      const sachyeuthich = await sachyeuthichService.createSachYeuThich(dto);
      res.status(201).json(sachyeuthich);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },
update: async (req, res) => {
    const user_id = req.query.user_id;
    const masach = req.query.masach;
    logger.info(`Controller: PUT /sachyeuthichs/${user_id} and ${masach}`);
    try {
      const validData = validateUpdateSachYeuThich(req.body);
      const dto = new UpdateSachYeuThichDTO(validData);
      const sachyeuthich = await sachyeuthichService.updateSachYeuThich(user_id, masach, dto);
      res.json(sachyeuthich);
    } catch (err) {
      logger.error(`Controller Error: update failed (${user_id} and ${masach})`, err);
      res.status(400).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    const user_id = req.query.user_id;
    const masach = req.query.masach;
    logger.info(`Controller: DELETE /sachyeuthichs/${user_id} and ${masach}`);
    try {
      const result = await sachyeuthichService.deleteSachYeuThich(user_id, masach);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${user_id} and ${masach})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
