import { CreateUserDTO } from "../dtos/users/create-user.dto.js";
import { UpdateUserDTO } from "../dtos/users/update-user.dto.js";
import { userService } from "../services/user.service.js";

import { validateCreateUser } from "../validators/users/create-user.validator.js";
import { validateUpdateUser } from "../validators/users/update-user.validator.js";

import { logger } from "../config/logger.js";

export const userController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /users");
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    const id = +req.params.id;
    logger.info(`Controller: GET /users/${id}`);

    try {
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (err) {
      logger.error(`Controller Error: getById failed (${id})`, err);
      res.status(404).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      logger.info("Controller: POST /users");

      // VALIDATE INPUT
      const validData = validateCreateUser(req.body);

      // CREATE DTO
      const dto = new CreateUserDTO(validData);

      const user = await userService.createUser(dto);
      res.status(201).json(user);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const id = +req.params.id;
    logger.info(`Controller: PUT /users/${id}`);

    try {
      // VALIDATE INPUT
      const validData = validateUpdateUser(req.body);

      // CREATE DTO
      const dto = new UpdateUserDTO(validData);

      const user = await userService.updateUser(id, dto);
      res.json(user);
    } catch (err) {
      logger.error(`Controller Error: update failed (${id})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const id = +req.params.id;
    logger.info(`Controller: DELETE /users/${id}`);

    try {
      const result = await userService.deleteUser(id);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${id})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};
