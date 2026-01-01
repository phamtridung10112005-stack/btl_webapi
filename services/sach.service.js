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
    logger.info(`Service: Paging sachs - Page: ${page}`);
    const sachs = await sachRepository.getSachPagingAndSorting(page, size, sortBy, sortOrder);
    return {
      data: sachs.rows,
      pagination: sachs.pagination
    };
  },

  createSach: async (dto) => {
    logger.info(`Service: Creating new sach`);
    const created = await sachRepository.create(dto);
    return new SachDTO(created);
  },

  updateSach: async (masach, dto) => {
    logger.info(`Service: Updating sach ${masach}`);
    const existing = await sachRepository.getByMaSach(masach);
    if (!existing) {
      throw new Error('Sach not found');
    }
    
    // Merge dữ liệu cũ và mới để đảm bảo không bị mất dữ liệu field khác
    const updateData = { ...existing, ...dto };
    const updated = await sachRepository.update(masach, updateData);
    return new SachDTO(updated);
  },

  deleteSach: async (masach) => {
    logger.info(`Service: Deleting sach ${masach}`);
    const existing = await sachRepository.getByMaSach(masach);
    if (!existing) {
      throw new Error('Sach not found');
    }
    await sachRepository.delete(masach);
    return { message: 'Sach deleted successfully' };
  },
};