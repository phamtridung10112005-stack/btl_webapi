// File: theloai.service.js
import { theloaiRepository } from '../repositories/theloai.repository.js';
import { TheLoaiDTO } from '../dtos/theloai/theloai.dto.js';
import { logger } from "../config/logger.js";

export const theloaiService = {
  getAllTheLoais: async () => {
    logger.info('Service: Getting all theloais');
    const theloais = await theloaiRepository.getAll();
    return theloais.map((u) => new TheLoaiDTO(u));
  },
getTheLoaiByMaTheLoai: async (matheloai) => {
    logger.info(`Service: Getting theloai by matheloai ${matheloai}`);
    const theloai = await theloaiRepository.getByMaTheLoai(matheloai);
    if (!theloai) {
      logger.warn(`Service Warning: TheLoai ${matheloai} not found`);
      throw new Error('TheLoai not found');
    }
    return new TheLoaiDTO(theloai);
  },
createTheLoai: async (dto) => {
    logger.info(`Service: Creating new theloai ${dto.MaTheLoai}`);
    const created = await theloaiRepository.create(dto);
    return new TheLoaiDTO(created);
  },
  updateTheLoai: async (matheloai, dto) => {
    logger.info(`Service: Updating theloai ${matheloai}`);
    const existing = await theloaiRepository.getByMaTheLoai(matheloai);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. TheLoai ${matheloai} not found`);
      throw new Error('TheLoai not found');
    }
    const updated = await theloaiRepository.update(matheloai, dto);
    return new TheLoaiDTO(updated);
  },
deleteTheLoai: async (matheloai) => {
    logger.info(`Service: Deleting theloai ${matheloai}`);
    const existing = await theloaiRepository.getByMaTheLoai(matheloai);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. TheLoai ${matheloai} not found`);
      throw new Error('TheLoai not found');
    }
    await theloaiRepository.delete(matheloai);
    return { message: 'TheLoai deleted successfully' };
  },
};
