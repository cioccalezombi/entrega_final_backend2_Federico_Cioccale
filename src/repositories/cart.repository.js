import { CartDAO } from "../dao/cart.dao.js";

const cartDAO = new CartDAO();

export class CartRepository {
  async create() {
    return cartDAO.create();
  }

  async getById(id) {
    return cartDAO.findById(id);
  }

  async update(id, data) {
    return cartDAO.update(id, data);
  }

  async addProduct(cartId, productId) {
    return cartDAO.addProduct(cartId, productId);
  }
}
