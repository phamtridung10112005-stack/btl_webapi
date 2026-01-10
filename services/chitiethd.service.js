// File: chitiethd.service.js
import { chitiethdRepository } from '../repositories/chitiethd.repository.js';
import { ChiTietHDDTO } from '../dtos/chitiethd/chitiethd.dto.js';
import { logger } from "../config/logger.js";

export const chitiethdService = {
  getAllChiTietHDs: async () => {
    logger.info('Service: Getting all chitiethds');
    const chitiethds = await chitiethdRepository.getAll();
    return chitiethds.map((u) => new ChiTietHDDTO(u));
  },
  getChiTietHDByMaHoaDonAndMaSach: async (mahoadon, masach) => {
    logger.info(`Service: Getting chitiethd by mahoadon ${mahoadon} and masach ${masach}`);
    const chitiethd = await chitiethdRepository.getByMaHoaDonAndMaSach(mahoadon, masach);
    if (!chitiethd) {
      logger.warn(`Service Warning: ChiTietHD ${mahoadon} and masach ${masach} not found`);
      throw new Error('ChiTietHD not found');
    }
    return new ChiTietHDDTO(chitiethd);
  },
getChiTietHDByMaHoaDon: async (mahoadon) => {
    logger.info(`Service: Getting chitiethd by mahoadon ${mahoadon}`);
    const chitiethd = await chitiethdRepository.getByMaHoaDon(mahoadon);
    if (!chitiethd) {
      logger.warn(`Service Warning: ChiTietHD ${mahoadon} not found`);
      throw new Error('ChiTietHD not found');
    }
    return new ChiTietHDDTO(chitiethd);
  },
createChiTietHD: async (dto) => {
    logger.info(`Service: Creating new chitiethd ${dto.MaHoaDon}`);
    const created = await chitiethdRepository.create(dto);
    return new ChiTietHDDTO(created);
  },
updateChiTietHDByMHDAndMS: async (mahoadon, masach, dto) => {
    logger.info(`Service: Updating chitiethd mahoadon ${mahoadon} and masach ${masach}`);
    const existing = await chitiethdRepository.getByMaHoaDonAndMaSach(mahoadon, masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. ChiTietHD mahoadon ${mahoadon} and masach ${masach} not found`);
      throw new Error('ChiTietHD not found');
    }
    const updated = await chitiethdRepository.updateByMHDAndMS(mahoadon, masach, dto);
    return new ChiTietHDDTO(updated);
  },
deleteChiTietHDByMHD: async (mahoadon) => {
    logger.info(`Service: Deleting chitiethd ${mahoadon}`);
    const existing = await chitiethdRepository.getByMaHoaDon(mahoadon);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. ChiTietHD ${mahoadon} not found`);
      throw new Error('ChiTietHD not found');
    }
    await chitiethdRepository.deleteByMHD(mahoadon);
    return { message: 'ChiTietHD deleted successfully' };
  },
  deleteChiTietHDByMHDAndMS: async (mahoadon, masach) => {
    logger.info(`Service: Deleting chitiethd mahoadon ${mahoadon} and masach ${masach}`);
    const existing = await chitiethdRepository.getByMaHoaDonAndMaSach(mahoadon, masach);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. ChiTietHD mahoadon ${mahoadon} and masach ${masach} an not found`);
      throw new Error('ChiTietHD not found');
    }
    await chitiethdRepository.deleteByMHDAndMS(mahoadon, masach);
    return { message: 'ChiTietHD deleted successfully' };
  },
};
