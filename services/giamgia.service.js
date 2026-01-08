// File: giamgia.service.js
import { giamgiaRepository } from '../repositories/giamgia.repository.js';
import { GiamGiaDTO } from '../dtos/giamgia/giamgia.dto.js';
import { logger } from "../config/logger.js";

export const giamgiaService = {
  getAllGiamGias: async () => {
    logger.info('Service: Getting all giamgias');
    const giamgias = await giamgiaRepository.getAll();
    return giamgias.map((u) => new GiamGiaDTO(u));
  },
getGiamGiaByMaGiamGia: async (magiamgia) => {
    logger.info(`Service: Getting giamgia by magiamgia ${magiamgia}`);
    const giamgia = await giamgiaRepository.getByMaGiamGia(magiamgia);
    if (!giamgia) {
      logger.warn(`Service Warning: GiamGia ${magiamgia} not found`);
      throw new Error('GiamGia not found');
    }
    return new GiamGiaDTO(giamgia);
  },
createGiamGia: async (dto) => {
    logger.info(`Service: Creating new giamgia ${dto.MaGiamGia}`);
    const created = await giamgiaRepository.create(dto);
    return new GiamGiaDTO(created);
  },
  updateGiamGia: async (magiamgia, dto) => {
    logger.info(`Service: Updating giamgia ${magiamgia}`);
    const existing = await giamgiaRepository.getByMaGiamGia(magiamgia);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. GiamGia ${magiamgia} not found`);
      throw new Error('GiamGia not found');
    }
    const updated = await giamgiaRepository.update(magiamgia, dto);
    return new GiamGiaDTO(updated);
  },
deleteGiamGia: async (magiamgia) => {
    logger.info(`Service: Deleting giamgia ${magiamgia}`);
    const existing = await giamgiaRepository.getByMaGiamGia(magiamgia);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. GiamGia ${magiamgia} not found`);
      throw new Error('GiamGia not found');
    }
    await giamgiaRepository.delete(magiamgia);
    return { message: 'GiamGia deleted successfully' };
  },
};
