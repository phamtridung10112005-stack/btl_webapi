import { userRepository } from "../repositories/user.repository.js";
import { UserDTO } from "../dtos/users/user.dto.js";
import { logger } from "../config/logger.js";
import bcrypt from "bcryptjs"; // [QUAN TRỌNG]: Import bcrypt

export const userService = {
  // ... (Giữ nguyên getAllUsers, getUserById, getUserByEmail) ...
  getAllUsers: async () => {
    logger.info("Service: Getting all users");
    const users = await userRepository.getAll();
    return users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role 
    }));
  },

  getUserById: async (id) => {
    logger.info(`Service: Getting user by ID ${id}`);
    const user = await userRepository.getById(id);
    if (!user) {
      logger.warn(`Service Warning: User ${id} not found`);
      throw new Error("User not found");
    }
    return new UserDTO(user);
  },

  getUserByEmail: async (email) => {
    logger.info(`Service: Getting user by email ${email}`);
    const user = await userRepository.getByEmail(email);
    if (!user) {
      logger.warn(`Service Warning: User with email ${email} not found`);
      throw new Error("User not found");
    }
    return new UserDTO(user);
  },

  // [HÀM NÀY CẦN SỬA LẠI HOÀN TOÀN NHƯ SAU]:
  createUser: async (dto) => {
    logger.info(`Service: Creating new user ${dto.email}`);
    
    // Mã hóa mật khẩu trước khi lưu
    if (dto.password) {
        const salt = await bcrypt.genSalt(10);
        dto.password = await bcrypt.hash(dto.password, salt);
    }

    const created = await userRepository.create(dto);
    return new UserDTO(created);
  },

  // ... (Giữ nguyên updateUser, toggleBlockUser, deleteUser) ...
  updateUser: async (id, dto) => {
    logger.info(`Service: Updating user ${id}`);

    const existing = await userRepository.getById(id);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. User ${id} not found`);
      throw new Error("User not found");
    }

    // [MỚI] Nếu có gửi mật khẩu mới lên, hãy mã hóa nó
    if (dto.password) {
        const salt = await bcrypt.genSalt(10);
        dto.password = await bcrypt.hash(dto.password, salt);
    }

    const updated = await userRepository.update(id, dto);
    return new UserDTO(updated);
  },

  toggleBlockUser: async (id) => {
    logger.info(`Service: Toggling block status for user ${id}`);
    
    // 1. Kiểm tra user tồn tại
    const user = await userRepository.getById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // 2. Không cho khóa Admin
    if (user.role === 'ADMIN') {
      throw new Error("Không thể khóa tài khoản Admin!");
    }

    // 3. Đổi trạng thái: LOCKED <-> USER
    const newRole = (user.role === 'LOCKED') ? 'USER' : 'LOCKED';
    
    // 4. Lưu xuống DB
    await userRepository.updateRole(id, newRole);
    
    return { 
      id: user.id, 
      role: newRole, 
      message: newRole === 'LOCKED' ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản" 
    };
  },

  deleteUser: async (id) => {
    // ... (giữ nguyên code cũ)
    logger.info(`Service: Deleting user ${id}`);
    const existing = await userRepository.getById(id);
    if (!existing) {
       logger.warn(`Service Warning: Cannot delete. User ${id} not found`);
       throw new Error("User not found");
    }
    await userRepository.delete(id);
    return { message: "User deleted successfully" };
  },

  deleteUser: async (id) => {
    logger.info(`Service: Deleting user ${id}`);
    const existing = await userRepository.getById(id);
    if (!existing) throw new Error("User not found");
    await userRepository.delete(id);
    return { message: "User deleted successfully" };
  },
};