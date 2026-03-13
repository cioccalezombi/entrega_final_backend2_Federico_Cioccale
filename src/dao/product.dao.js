import { Product } from "../models/product.model.js";

export class ProductDAO {
  async findAll() {
    return Product.find();
  }

  async findById(id) {
    return Product.findById(id);
  }

  async create(data) {
    return Product.create(data);
  }

  async update(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}
