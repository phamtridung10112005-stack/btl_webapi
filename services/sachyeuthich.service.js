// File: sachyeuthich.service.js
import { sachyeuthichRepository } from '../repositories/sachyeuthich.repository.js';
import { SachYeuThichDTO } from '../dtos/sachyeuthich/sachyeuthich.dto.js';
import { logger } from "../config/logger.js";

export const sachyeuthichService = {
  getAllSachYeuThichs: async () => {
    logger.info('Service: Getting all sachyeuthichs');
    const sachyeuthichs = await sachyeuthichRepository.getAll();
    return sachyeuthichs.map((u) => new SachYeuThichDTO(u));
  },
getSachYeuThichByUser_ID: async (user_id) => {
    logger.info(`Service: Getting sachyeuthich by user_id ${user_id}`);
    const sachyeuthichs = await sachyeuthichRepository.getByUser_ID(user_id);
    if (!sachyeuthichs) {
      logger.warn(`Service Warning: SachYeuThich ${user_id} not found`);
      throw new Error('SachYeuThich not found');
    }
    return sachyeuthichs.map(r => r.MaSach);
  },
getSachYeuThichByMaSach: async (masach) => {
    logger.info(`Service: Getting sachyeuthich by masach ${masach}`);
    const sachyeuthichs = await sachyeuthichRepository.getByMaSach(masach);
    if (!sachyeuthichs) {
      logger.warn(`Service Warning: SachYeuThich ${masach} not found`);
      throw new Error('SachYeuThich not found');
    }
    return sachyeuthichs.map((u) => new SachYeuThichDTO(u));
},
getSachYeuThichByUser_ID_AND_MaSach: async (user_id, masach) => {
    logger.info(`Service: Getting sachyeuthich by user_id ${user_id} and masach ${masach}`);
    const sachyeuthich = await sachyeuthichRepository.getByUser_ID_AND_MaSach(user_id, masach);
    if (!sachyeuthich) {
      logger.warn(`Service Warning: SachYeuThich with user_id ${user_id} and masach ${masach} not found`);
      throw new Error('SachYeuThich not found');
    }
    return new SachYeuThichDTO(sachyeuthich);
  },
createSachYeuThich: async (dto) => {
    logger.info(`Service: Creating new sachyeuthich ${dto.User_ID}`);
    const created = await sachyeuthichRepository.create(dto);
    return new SachYeuThichDTO(created);
  },
  updateSachYeuThich: async (user_id, masach, dto) => {
    logger.info(`Service: Updating sachyeuthich ${user_id} and ${masach}`);
    const existing = await sachyeuthichRepository.getByUser_ID_AND_MaSach(user_id, masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. SachYeuThich ${user_id} and ${masach} not found`);
      throw new Error('SachYeuThich not found');
    }
    const updated = await sachyeuthichRepository.update(user_id, masach, dto);
    return new SachYeuThichDTO(updated);
  },
deleteSachYeuThich: async (user_id, masach) => {
    logger.info(`Service: Deleting sachyeuthich ${user_id} and ${masach}`);
    const existing = await sachyeuthichRepository.getByUser_ID_AND_MaSach(user_id, masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. SachYeuThich ${user_id} and ${masach} not found`);
      throw new Error('SachYeuThich not found');
    }
    await sachyeuthichRepository.delete(user_id, masach);
    return { message: 'SachYeuThich deleted successfully' };
  },
};
