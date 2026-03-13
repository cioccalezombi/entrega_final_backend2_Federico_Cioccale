import { UsersService } from "../services/users.service.js";
import mongoose from "mongoose";

export class UsersController {
  static async create(req, res) {
    try {
      const user = await UsersService.createUser(req.body);
      res.status(201).json({ status: "success", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const users = await UsersService.getUsers();
      res.json({ status: "success", users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    const { uid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user id" });
    }

    try {
      const user = await UsersService.getUserById(req.params.uid);
      res.json({ status: "success", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    const { uid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user id" });
    }

    try {
      const user = await UsersService.updateUser(req.params.uid, req.body);
      res.json({ status: "success", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    const { uid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(400).json({ status: "error", message: "Invalid user id" });
    }

    try {
      const deleted = await UsersService.deleteUser(uid);

      if (!deleted) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }

      return res.json({ status: "success", message: "User deleted" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
