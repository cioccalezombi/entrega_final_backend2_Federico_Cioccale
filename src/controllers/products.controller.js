import { ProductsService } from "../services/products.service.js";

export class ProductsController {
  static async getAll(req, res) {
    try {
      const products = await ProductsService.getAll();
      res.json({ status: "success", products });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const product = await ProductsService.getById(req.params.pid);
      res.json({ status: "success", product });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const product = await ProductsService.create(req.body);
      res.status(201).json({ status: "success", product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const product = await ProductsService.update(req.params.pid, req.body);
      res.json({ status: "success", product });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await ProductsService.delete(req.params.pid);
      res.json({ status: "success", message: "Producto eliminado" });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}
