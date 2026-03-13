import { ProductRepository } from "../repositories/product.repository.js";

const productRepository = new ProductRepository();

export class ProductsService {
  static async getAll() {
    return productRepository.getAll();
  }

  static async getById(id) {
    const product = await productRepository.getById(id);
    if (!product) throw new Error("Producto no encontrado");
    return product;
  }

  static async create(data) {
    return productRepository.create(data);
  }

  static async update(id, data) {
    const product = await productRepository.update(id, data);
    if (!product) throw new Error("Producto no encontrado");
    return product;
  }

  static async delete(id) {
    const product = await productRepository.delete(id);
    if (!product) throw new Error("Producto no encontrado");
    return product;
  }
}
