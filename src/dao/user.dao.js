import { User } from "../models/user.model.js";

export class UserDAO {
  async findAll() {
    return User.find().select("-password").populate("cart");
  }

  async findById(id) {
    return User.findById(id).select("-password").populate("cart");
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true })
      .select("-password")
      .populate("cart");
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }
}
