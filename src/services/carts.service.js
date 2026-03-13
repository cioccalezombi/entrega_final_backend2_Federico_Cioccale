import { CartRepository } from "../repositories/cart.repository.js";
import { ProductRepository } from "../repositories/product.repository.js";
import { TicketRepository } from "../repositories/ticket.repository.js";

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const ticketRepository = new TicketRepository();

export class CartsService {
  static async getById(id) {
    const cart = await cartRepository.getById(id);
    if (!cart) throw new Error("Carrito no encontrado");
    return cart;
  }

  static async addProduct(cartId, productId) {
    return cartRepository.addProduct(cartId, productId);
  }

  /**
   * Procesa la compra de un carrito:
   * 1. Verifica stock por cada producto
   * 2. Descuenta stock de los que alcanzan
   * 3. Genera ticket con los que sí se compraron
   * 4. Limpia del carrito los productos comprados
   * 5. Retorna { ticket, productsWithoutStock }
   */
  static async purchase(cartId, purchaserEmail) {
    const cart = await cartRepository.getById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    const purchased = [];
    const productsWithoutStock = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = item.product;
      if (product.stock >= item.quantity) {
        // Hay stock suficiente
        totalAmount += product.price * item.quantity;
        purchased.push(item);

        // Descuenta stock
        await productRepository.update(product._id, {
          stock: product.stock - item.quantity,
        });
      } else {
        productsWithoutStock.push(product._id);
      }
    }

    let ticket = null;
    if (purchased.length > 0) {
      ticket = await ticketRepository.create({
        amount: totalAmount,
        purchaser: purchaserEmail,
      });

      // Limpiar del carrito solo los productos comprados
      const remainingProducts = cart.products.filter((item) =>
        productsWithoutStock.some(
          (id) => id.toString() === item.product._id.toString()
        )
      );
      await cartRepository.update(cartId, { products: remainingProducts });
    }

    return { ticket, productsWithoutStock };
  }
}
