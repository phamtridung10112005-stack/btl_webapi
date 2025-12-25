// File: sachtacgia.service.js
import { sachtacgiaRepository } from '../repositories/sachtacgia.repository.js';
import { SachTacGiaDTO } from '../dtos/sachtacgia/sachtacgia.dto.js';
import { logger } from "../config/logger.js";

export const sachtacgiaService = {
  getAllSachTacGias: async () => {
    logger.info('Service: Getting all sachtacgias');
    const sachtacgias = await sachtacgiaRepository.getAll();
    return sachtacgias.map((u) => new SachTacGiaDTO(u));
  },
createSachTacGia: async (dto) => {
    logger.info(`Service: Creating new sachtacgia ${dto.MaSach}`);
    const created = await sachtacgiaRepository.create(dto);
    return new SachTacGiaDTO(created);
  },
deleteSachTacGia: async (masach, matacgia) => {
    logger.info(`Service: Deleting sachtacgia with masach ${masach} and matacgia ${matacgia}`);
    const existing = await sachtacgiaRepository.getByMaSachAndMaTacGia(masach, matacgia);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. SachTacGia with ${masach} and matacgia ${matacgia} not found`);
      throw new Error('SachTacGia not found');
    }
    await sachtacgiaRepository.delete(masach, matacgia);
    return { message: 'SachTacGia deleted successfully' };
  },
};
