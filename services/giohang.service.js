import { giohangRepository } from '../repositories/giohang.repository.js';
import { GioHangDTO } from '../dtos/giohang/giohang.dto.js';
import { logger } from "../config/logger.js";
export const giohangService = {
  getAllGioHangs: async () => {
    logger.info('Service: Getting all giohangs');
    const giohangs = await giohangRepository.getAll();
    return giohangs.map((u) => new GioHangDTO(u));
  },
getGioHangByMaGioHang: async (magiohang) => {
    logger.info(`Service: Getting giohang by magiohang ${magiohang}`);
    const giohang = await giohangRepository.getByMaGioHang(magiohang);
    if (!giohang) {
      logger.warn(`Service Warning: GioHang ${magiohang} not found`);
      throw new Error('GioHang not found');
    }
    return new GioHangDTO(giohang);
  },
createGioHang: async (dto) => {
    logger.info(`Service: Creating new giohang ${dto.MaGioHang}`);
    const created = await giohangRepository.create(dto);
    return new GioHangDTO(created);
  },
  updateGioHang: async (magiohang, dto) => {
    logger.info(`Service: Updating giohang ${magiohang}`);
    const existing = await giohangRepository.getByMaGioHang(magiohang);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. GioHang ${magiohang} not found`);
      throw new Error('GioHang not found');
    }
    const updated = await giohangRepository.update(magiohang, dto);
    return new GioHangDTO(updated);
  },

deleteGioHang: async (magiohang) => {
    logger.info(`Service: Deleting giohang ${magiohang}`);
    const existing = await giohangRepository.getByMaGioHang(magiohang);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. GioHang ${magiohang} not found`);
      throw new Error('GioHang not found');
    }
    await giohangRepository.delete(magiohang);
    return { message: 'GioHang deleted successfully' };
  },
};
