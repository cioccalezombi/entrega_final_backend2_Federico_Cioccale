import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { UserDTO } from "../dtos/user.dto.js";
import { UsersService } from "../services/users.service.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

export class SessionsController {
  
  static async register(req, res) {
    try {
      const user = await UsersService.createUser(req.body);
      res.status(201).json({ status: "success", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static login(req, res) {
    const user = req.user;

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      status: "success",
      token,
    });
  }

  static current(req, res) {
    // Usamos el DTO para evitar enviar datos sensibles como el password o resetTokens
    const userDTO = new UserDTO(req.user);

    return res.json({
      status: "success",
      user: userDTO,
    });
  }

  static async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await UsersService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
      }

      const resetToken = jwt.sign({ email }, config.JWT_SECRET, { expiresIn: "1h" });
      
      await UsersService.updateUser(user._id, {
        resetToken,
        resetTokenExpires: Date.now() + 3600000 // 1 hora
      });

      const resetLink = `http://localhost:${config.PORT}/api/sessions/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, resetLink);

      res.json({ status: "success", message: "Email enviado. Revisa tu casilla." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await UsersService.getUserByEmail(decoded.email);

      if (!user || user.resetToken !== token || user.resetTokenExpires < Date.now()) {
        return res.status(400).json({ status: "error", message: "Token inválido o expirado" });
      }

      // Evitar que actualice si data.password (haseado en UserRepository) es igual al hash actual.
      // Acá le enviamos raw, UserRepo lo hashea, por lo tanto si luego coinciden se descarta.
      // Hacemos el chequeo explícito a nivel bcrypt:
      // Como estamos enviando la password sin hashear a `updateUser`, el repository se encarga de todo.
      // Pero debemos verificar usando la utilidad q valide.
      
      const { isValidPassword, hashPassword } = await import("../utils/bcrypt.js");

      if (isValidPassword(newPassword, user.password)) {
        return res.status(400).json({
           status: "error", 
           message: "No puedes usar la misma contraseña que ya tenías" 
        });
      }

      await UsersService.updateUser(user._id, {
        password: newPassword, // Entra como texto plano, UserRepository se encarga de encriptarlo
        resetToken: null,
        resetTokenExpires: null,
      });

      res.json({ status: "success", message: "Contraseña actualizada exitosamente" });

    } catch (error) {
       res.status(500).json({ error: error.message });
    }
  }
}
