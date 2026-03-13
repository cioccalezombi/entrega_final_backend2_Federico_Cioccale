import { Cart } from "../models/cart.model.js";

export class CartDAO {
  async create() {
    return Cart.create({});
  }

  async findById(id) {
    return Cart.findById(id).populate("products.product");
  }

  async update(id, data) {
    return Cart.findByIdAndUpdate(id, data, { new: true }).populate(
      "products.product"
    );
  }

  async addProduct(cartId, productId) {
    const cart = await Cart.findById(cartId);
    const existing = cart.products.find(
      (p) => p.product.toString() === productId
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }
    return cart.save();
  }
}
