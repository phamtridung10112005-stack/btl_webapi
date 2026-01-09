import { giohangRepository } from '../repositories/giohang.repository.js';
import { GioHangDTO } from '../dtos/giohang/giohang.dto.js';
import { logger } from "../config/logger.js";
export const giohangService = {
  getAllGioHangs: async () => {
    logger.info('Service: Getting all giohangs');
    const giohangs = await giohangRepository.getAll();
    return giohangs.map((u) => new GioHangDTO(u));
  },
getGioHangByMaSach: async (masach) => {
    logger.info(`Service: Getting giohang by masach ${masach}`);
    const giohang = await giohangRepository.getByMaSach(masach);
    if (!giohang) {
      logger.warn(`Service Warning: GioHang masach ${masach} not found`);
      throw new Error('GioHang not found');
    }
    return giohang.map((u) => new GioHangDTO(u));
  },
  getGioHangByUserID: async (user_id) => {
    logger.info(`Service: Getting giohang by user_id ${user_id}`);
    const giohang = await giohangRepository.getByUserId(user_id);
    if (!giohang) {
      logger.warn(`Service Warning: GioHang user_id ${user_id} not found`);
      throw new Error('GioHang not found');
    }
    return giohang.map((u) => new GioHangDTO(u));
  },
  getTTGioHangByUserID: async (user_id) => {
    logger.info(`Service: Getting TTgiohang by user_id ${user_id}`);
    const giohang = await giohangRepository.getDetailsGioHangByUserID(user_id);
    if (!giohang) {
      logger.warn(`Service Warning: TTGioHang user_id ${user_id} not found`);
      throw new Error('TTGioHang not found');
    }
    return giohang;
  },
  getGioHangByUserIDAndMaSach: async (user_id, masach) => {
    logger.info(`Service: Getting giohang by user_id ${user_id} and masach ${masach}`);
    const giohang = await giohangRepository.getByUserIdAndMaSach(user_id, masach);
    if (!giohang) {
      logger.warn(`Service Warning: GioHang user_id ${user_id} and masach ${masach} not found`);
      throw new Error('GioHang not found');
    }
    return new GioHangDTO(giohang);
  },
createGioHang: async (dto) => {
    logger.info(`Service: Creating new giohang user_id ${dto.User_ID} and masach ${dto.MaSach}`);
    const created = await giohangRepository.create(dto);
    return new GioHangDTO(created);
  },
  updateGioHang: async (user_id, masach, dto) => {
    logger.info(`Service: Updating giohang user_id ${user_id} and masach ${masach}`);
    const existing = await giohangRepository.getByUserIdAndMaSach(user_id, masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. GioHang user_id ${user_id} and masach ${masach} not found`);
      throw new Error('GioHang not found');
    }
    const updated = await giohangRepository.update(user_id, masach, dto);
    return new GioHangDTO(updated);
  },

deleteGioHang: async (user_id, masach) => {
    logger.info(`Service: Deleting giohang user_id ${user_id} and masach ${masach}`);
    const existing = await giohangRepository.getByUserIdAndMaSach(user_id, masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. GioHang user_id ${user_id} and masach ${masach} not found`);
      throw new Error('GioHang not found');
    }
    await giohangRepository.delete(user_id, masach);
    return { message: 'GioHang deleted successfully' };
  },
  deleteAllGioHangByUserID: async (user_id) => {
    logger.info(`Service: Deleting All giohang user_id ${user_id}`);
    const existing = await giohangRepository.getByUserId(user_id);
    if (!existing) {
      logger.warn(`Service Warning: Cannot deleteAll. GioHang user_id ${user_id}`);
      throw new Error('GioHang not found');
    }
    await giohangRepository.deleteAllByUserID(user_id);
    return { message: 'GioHang deleted successfully' };
  },
};
