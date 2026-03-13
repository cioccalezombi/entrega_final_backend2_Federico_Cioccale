# Backend II - Entrega Final (Ecommerce) 


## REQUISITOS

* Node.js 18+ (recomendado)
* Cuenta / cluster en MongoDB Atlas
* Cuenta de Google con App Passwords activado (para el envío de mails)

## INSTALACIÓN

Ejecutar en la raíz del proyecto para instalar las dependencias (`express`, `mongoose`, `passport`, `bcrypt`, `nodemailer`, `uuid`, etc):

```bash
npm install
```

## VARIABLES DE ENTORNO

Crear un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=tuSecretoJWT
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_google
FRONTEND_URL=http://localhost:3000
```

> **Importante:** Jamás subir el archivo `.env` real al repositorio.

## EJECUCIÓN EN DESARROLLO

```bash
npm run dev
```

* **Servidor backend / Frontend Tester:** [http://localhost:3000](http://localhost:3000)
* **Health check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

## ARQUITECTURA DEL PROYECTO

El proyecto emplea el patrón de diseño **Repository + DAO**:

* **DAO (Data Access Object):** Carpeta `src/dao/`. Aquí residen las clases que hacen las consultas directas a la base de datos (Mongoose).
* **Repository:** Carpeta `src/repositories/`. Abstracción por encima del DAO, encargada de reglas de negocio en la manipulación de datos (ej: hashear la contraseña antes de mandarla al DAO).
* **DTO (Data Transfer Object):** Carpeta `src/dtos/`. Estandariza la información sensible que viaja al frontend.

---

## PRINCIPALES ENDPOINTS Y NEGOCIO

### 1. Usuarios (Users CRUD)
* `GET /api/users` - Listar usuarios
* `POST /api/users` - Crear usuario (CRUD Admin)
* **Auth Register:** `POST /api/sessions/register` - Registro público de usuarios (crea el carrito asociado).

### 2. Autenticación (Sessions & JWT)
* `POST /api/sessions/login` - Verifica credenciales y devuelve el JWT.
* `GET /api/sessions/current` - Lee el JWT del Header Authorization y devuelve el usuario validado **usando DTO** (sin contraseña ni info basura).

### 3. Recuperación de Contraseñas (Password Reset)
* `POST /api/sessions/forgot-password` - Recibe un email, le genera un token válido por 1hr y envía el link mediante Nodemailer.
* `POST /api/sessions/reset-password` - Recibe de cuerpo el nuevo password y el token temporal. Valida que no sea idéntica a la anterior y la cambia.

### 4. Productos (Products) - Requiere rol de `admin`
* `GET /api/products` - Lista todos los productos. (Público)
* `POST /api/products` - Creación de productos. Valida rol admin.
* `PUT /api/products/:pid`
* `DELETE /api/products/:pid`

### 5. Carritos (Carts) - Requiere rol de `user`
* `POST /api/carts/:cid/products/:pid` - Suma cantidad o agrega el producto al arreglo de un carrito. Requiere rol user.
* `POST /api/carts/:cid/purchase` - **El Checkout.** 
  1. Verifica el stock del producto en la colección Products.
  2. Descuenta el stock de los productos que alcanzan.
  3. Genera un modelo `Ticket` emitiendo un código UUID auto-generado, importe total y el email del comprador.
  4. Los productos no comprados por falta de stock quedan devueltos en el carrito y el payload de error.

---

## FRONT TESTER (SIN POSTMAN)

El proyecto incluye un dashboard web interactivo para testear toda la entrega sin depender de clientes externos:

* **Tab 1:** Autenticación (Login, Registro, Password Reset, Lista de Usuarios/Roles).
* **Tab 2:** Gestión de Productos (Cargar artículos, modificar precio y stock, borrar).
* **Tab 3:** Gestión de Carritos (Añadir los productos creados en el Tab 2 a un carrito y ejecutar la compra final viendo el Ticket emitido).

Abre tu navegador en: [http://localhost:3000](http://localhost:3000) (El front cargará la UI estática automáticamente).

---
**Autor:** Federico Cioccale
