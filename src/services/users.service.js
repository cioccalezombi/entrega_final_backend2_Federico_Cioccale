import { UserRepository } from "../repositories/user.repository.js";

const userRepository = new UserRepository();

export class UsersService {
  static async createUser(userData) {
    return userRepository.create(userData);
  }

  static async getUsers() {
    return userRepository.getAll();
  }

  static async getUserById(id) {
    return userRepository.getById(id);
  }

  static async updateUser(id, data) {
    return userRepository.update(id, data);
  }

  static async deleteUser(id) {
    return userRepository.delete(id);
  }

  static async getUserByEmail(email) {
    return userRepository.getByEmail(email);
  }
}
