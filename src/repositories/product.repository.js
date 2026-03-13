import { ProductDAO } from "../dao/product.dao.js";

const productDAO = new ProductDAO();

export class ProductRepository {
  async getAll() {
    return productDAO.findAll();
  }

  async getById(id) {
    return productDAO.findById(id);
  }

  async create(data) {
    return productDAO.create(data);
  }

  async update(id, data) {
    return productDAO.update(id, data);
  }

  async delete(id) {
    return productDAO.delete(id);
  }
}
