import { UserDAO } from "../dao/user.dao.js";
import { CartDAO } from "../dao/cart.dao.js";
import { hashPassword } from "../utils/bcrypt.js";

const userDAO = new UserDAO();
const cartDAO = new CartDAO();

export class UserRepository {
  async getAll() {
    return userDAO.findAll();
  }

  async getById(id) {
    return userDAO.findById(id);
  }

  async getByEmail(email) {
    return userDAO.findByEmail(email);
  }

  async create(userData) {
    const cart = await cartDAO.create();
    const hashedPassword = hashPassword(userData.password);

    const newUser = await userDAO.create({
      ...userData,
      password: hashedPassword,
      cart: cart._id,
    });

    const obj = newUser.toObject();
    delete obj.password;
    return obj;
  }

  async update(id, data) {
    if (data.password) {
      data.password = hashPassword(data.password);
    }
    return userDAO.update(id, data);
  }

  async delete(id) {
    return userDAO.delete(id);
  }
}
