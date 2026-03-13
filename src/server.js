import app from "./app.js";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { User } from "./models/user.model.js";
import { Cart } from "./models/cart.model.js";
import { hashPassword } from "./utils/bcrypt.js";

async function bootstrap() {
  await connectDB();

  app.listen(config.PORT, () => {
    console.log(`🚀 Server escuchando en http://localhost:${config.PORT}`);
    console.log(`🧪 Health check: http://localhost:${config.PORT}/api/health`);
  });

  const test = async () => {
    const cart = await Cart.create({});

    await User.create({
      first_name: "Federico",
      last_name: "Test",
      email: "test@test.com",
      age: 30,
      password: hashPassword("123456"),
      cart: cart._id
    });

    console.log("Usuario de prueba creado");
  };

}

bootstrap();
