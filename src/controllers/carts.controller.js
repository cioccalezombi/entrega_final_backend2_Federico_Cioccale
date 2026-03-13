import { CartsService } from "../services/carts.service.js";

export class CartsController {
  static async getById(req, res) {
    try {
      const cart = await CartsService.getById(req.params.cid);
      res.json({ status: "success", cart });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async addProduct(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      const cart = await CartsService.addProduct(cartId, productId);
      res.json({ status: "success", message: "Producto agregado", cart });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async purchase(req, res) {
    try {
      const purchaserEmail = req.user.email;
      const result = await CartsService.purchase(req.params.cid, purchaserEmail);
      
      res.json({
        status: "success",
        ticket: result.ticket,
        productsWithoutStock: result.productsWithoutStock
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
