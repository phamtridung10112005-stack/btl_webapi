// File: tacgia.service.js
import { tacgiaRepository } from '../repositories/tacgia.repository.js';
import { TacGiaDTO } from '../dtos/tacgia/tacgia.dto.js';
import { logger } from "../config/logger.js";
export const tacgiaService = {
  getAllTacGias: async () => {
    logger.info('Service: Getting all tacgias');
    const tacgias = await tacgiaRepository.getAll();
    return tacgias.map((u) => new TacGiaDTO(u));
  },
getTacGiaByMaTacGia: async (matacgia) => {
    logger.info(`Service: Getting tacgia by matacgia ${matacgia}`);
    const tacgia = await tacgiaRepository.getByMaTacGia(matacgia);
    if (!tacgia) {
      logger.warn(`Service Warning: TacGia ${matacgia} not found`);
      throw new Error('TacGia not found');
    }
    return new TacGiaDTO(tacgia);
  },
createTacGia: async (dto) => {
    logger.info(`Service: Creating new tacgia ${dto.MaTacGia}`);
    const created = await tacgiaRepository.create(dto);
    return new TacGiaDTO(created);
  },
  updateTacGia: async (matacgia, dto) => {
    logger.info(`Service: Updating tacgia ${matacgia}`);
    const existing = await tacgiaRepository.getByMaTacGia(matacgia);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. TacGia ${matacgia} not found`);
      throw new Error('TacGia not found');
    }
    const updated = await tacgiaRepository.update(matacgia, dto);
    return new TacGiaDTO(updated);
  },
deleteTacGia: async (matacgia) => {
    logger.info(`Service: Deleting tacgia ${matacgia}`);
    const existing = await tacgiaRepository.getByMaTacGia(matacgia);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. TacGia ${matacgia} not found`);
      throw new Error('TacGia not found');
    }
    await tacgiaRepository.delete(matacgia);
    return { message: 'TacGia deleted successfully' };
  },
};
