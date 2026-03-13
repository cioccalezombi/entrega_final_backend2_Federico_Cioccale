import nodemailer from "nodemailer";
import { config } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

/**
 * Envía un email de recuperación de contraseña.
 * @param {string} to - Email del destinatario
 * @param {string} resetLink - URL con el token para resetear la contraseña
 */
export async function sendPasswordResetEmail(to, resetLink) {
  const mailOptions = {
    from: `"Ecommerce App" <${config.EMAIL_USER}>`,
    to,
    subject: "Recuperación de contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Recuperación de contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Hacé click en el siguiente botón para cambiarla. El enlace expira en <strong>1 hora</strong>.</p>
        <a 
          href="${resetLink}" 
          style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;"
        >
          Restablecer contraseña
        </a>
        <p style="color:#888;font-size:12px;">Si no solicitaste este cambio, ignorá este email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
