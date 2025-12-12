import { userRepository } from "../repositories/user.repository.js";
import { UserDTO } from "../dtos/users/user.dto.js";
import { logger } from "../config/logger.js";

export const userService = {
  getAllUsers: async () => {
    logger.info("Service: Getting all users");
    const users = await userRepository.getAll();
    return users.map((u) => new UserDTO(u));
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

  createUser: async (dto) => {
    logger.info(`Service: Creating new user ${dto.email}`);
    const created = await userRepository.create(dto);
    return new UserDTO(created);
  },

  updateUser: async (id, dto) => {
    logger.info(`Service: Updating user ${id}`);

    const existing = await userRepository.getById(id);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. User ${id} not found`);
      throw new Error("User not found");
    }

    const updated = await userRepository.update(id, dto);
    return new UserDTO(updated);
  },

  deleteUser: async (id) => {
    logger.info(`Service: Deleting user ${id}`);

    const existing = await userRepository.getById(id);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. User ${id} not found`);
      throw new Error("User not found");
    }

    await userRepository.delete(id);
    return { message: "User deleted successfully" };
  },
};
