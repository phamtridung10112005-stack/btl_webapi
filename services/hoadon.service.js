import { hoadonRepository } from '../repositories/hoadon.repository.js';
import { HoaDonDTO } from '../dtos/hoadon/hoadon.dto.js';
import { logger } from "../config/logger.js";

export const hoadonService = {
  getAllHoaDons: async () => {
    logger.info('Service: Getting all hoadons');
    const hoadons = await hoadonRepository.getAll();
    return hoadons.map((u) => new HoaDonDTO(u));
  },

  getHoaDonByMaHoaDon: async (mahoadon) => {
    logger.info(`Service: Getting hoadon by mahoadon ${mahoadon}`);
    const hoadon = await hoadonRepository.getByMaHoaDon(mahoadon);
    if (!hoadon) {
      logger.warn(`Service Warning: HoaDon ${mahoadon} not found`);
      throw new Error('HoaDon not found');
    }
    return new HoaDonDTO(hoadon);
  },

  createHoaDon: async (dto) => {
    logger.info(`Service: Creating new hoadon`);
    const created = await hoadonRepository.create(dto);
    return new HoaDonDTO(created);
  },

  updateHoaDon: async (mahoadon, dto) => {
    logger.info(`Service: Updating hoadon ${mahoadon}`);
    const existing = await hoadonRepository.getByMaHoaDon(mahoadon);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. HoaDon ${mahoadon} not found`);
      throw new Error('HoaDon not found');
    }
    
    // Merge dữ liệu cũ với dữ liệu mới để tránh bị null các trường không update
    const updateData = { ...existing, ...dto };
    // Loại bỏ các field undefined/null từ dto nếu cần, 
    // nhưng ở đây repository update full field nên ta truyền full merged object
    
    const updated = await hoadonRepository.update(mahoadon, updateData);
    return new HoaDonDTO(updated);
  },

  deleteHoaDon: async (mahoadon) => {
    logger.info(`Service: Deleting hoadon ${mahoadon}`);
    const existing = await hoadonRepository.getByMaHoaDon(mahoadon);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. HoaDon ${mahoadon} not found`);
      throw new Error('HoaDon not found');
    }
    await hoadonRepository.delete(mahoadon);
    return { message: 'HoaDon deleted successfully' };
  },
};