// File: sach.service.js
import { sachRepository } from '../repositories/sach.repository.js';
import { SachDTO } from '../dtos/sach/sach.dto.js';
import { logger } from "../config/logger.js";

export const sachService = {
  getAllSachs: async () => {
    logger.info('Service: Getting all sachs');
    const sachs = await sachRepository.getAll();
    return sachs.map((u) => new SachDTO(u));
  },
getSachByMaSach: async (masach) => {
    logger.info(`Service: Getting sach by masach ${masach}`);
    const sach = await sachRepository.getByMaSach(masach);
    if (!sach) {
      logger.warn(`Service Warning: Sach ${masach} not found`);
      throw new Error('Sach not found');
    }
    return new SachDTO(sach);
  },
getSachPagingAndSorting: async (page, size, sortBy, sortOrder) => {
    logger.info(`Service: Getting sachs with paging and sorting - Page: ${page}, Size: ${size}, SortBy: ${sortBy}, SortOrder: ${sortOrder}`);
    const sachs = await sachRepository.getSachPagingAndSorting(page, size, sortBy, sortOrder);
    return sachs.map((u) => new SachDTO(u));
  },
createSach: async (dto) => {
    logger.info(`Service: Creating new sach ${dto.MaSach}`);
    const created = await sachRepository.create(dto);
    return new SachDTO(created);
  },
  updateSach: async (masach, dto) => {
    logger.info(`Service: Updating sach ${masach}`);
    const existing = await sachRepository.getByMaSach(masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. Sach ${masach} not found`);
      throw new Error('Sach not found');
    }
    const updated = await sachRepository.update(masach, dto);
    return new SachDTO(updated);
  },
deleteSach: async (masach) => {
    logger.info(`Service: Deleting sach ${masach}`);
    const existing = await sachRepository.getByMaSach(masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. Sach ${masach} not found`);
      throw new Error('Sach not found');
    }
    await sachRepository.delete(masach);
    return { message: 'Sach deleted successfully' };
  },
};
