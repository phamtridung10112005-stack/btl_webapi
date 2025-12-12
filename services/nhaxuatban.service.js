// File: nhaxuatban.service.js
import { nhaxuatbanRepository } from '../repositories/nhaxuatban.repository.js';
import { NhaXuatBanDTO } from '../dtos/nhaxuatban/nhaxuatban.dto.js';
import { logger } from "../config/logger.js";
export const nhaxuatbanService = {
  getAllNhaXuatBans: async () => {
    logger.info('Service: Getting all nhaxuatbans');
    const nhaxuatbans = await nhaxuatbanRepository.getAll();
    return nhaxuatbans.map((u) => new NhaXuatBanDTO(u));
  },
getNhaXuatBanByMaNXB: async (manxb) => {
    logger.info(`Service: Getting nhaxuatban by manxb ${manxb}`);
    const nhaxuatban = await nhaxuatbanRepository.getByMaNXB(manxb);
    if (!nhaxuatban) {
      logger.warn(`Service Warning: NhaXuatBan ${manxb} not found`);
      throw new Error('NhaXuatBan not found');
    }
    return new NhaXuatBanDTO(nhaxuatban);
  },
createNhaXuatBan: async (dto) => {
    logger.info(`Service: Creating new nhaxuatban ${dto.MaNXB}`);
    const created = await nhaxuatbanRepository.create(dto);
    return new NhaXuatBanDTO(created);
  },
  updateNhaXuatBan: async (manxb, dto) => {
    logger.info(`Service: Updating nhaxuatban ${manxb}`);
    const existing = await nhaxuatbanRepository.getByMaNXB(manxb);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. NhaXuatBan ${manxb} not found`);
      throw new Error('NhaXuatBan not found');
    }
    const updated = await nhaxuatbanRepository.update(manxb, dto);
    return new NhaXuatBanDTO(updated);
  },
deleteNhaXuatBan: async (manxb) => {
    logger.info(`Service: Deleting nhaxuatban ${manxb}`);
    const existing = await nhaxuatbanRepository.getByMaNXB(manxb);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. NhaXuatBan ${manxb} not found`);
      throw new Error('NhaXuatBan not found');
    }
    await nhaxuatbanRepository.delete(manxb);
    return { message: 'NhaXuatBan deleted successfully' };
  },
};
