🇮🇩 [Baca versi Bahasa Indonesia](./README.id.md)
<p align="center">
  <img src="https://blogger.googleusercontent.com/img/a/AVvXsEjWze3a-83ZfufvHCwCXUbJArVFOISUVf66dGYHaQ6MknBalveNaaGK-N-0I4ZegpcK-Z6haxg5baB0IZabMsI3DivSamutVh_EOM38KVNYgrTCXA1aBeAWib9tg6gx_NJc3caOzq9EA9ryiexN5MgNehHotbr_gUvSpgYVNvwOMmTeWS1A2E1CH_9ooBBj" alt="Nest Zero Logo" width="300"/>
</p>

# 🚀 Nest Zero

A modular starter project built with [NestJS](https://nestjs.com/) + [Prisma ORM](https://www.prisma.io/) featuring a clean and extensible architecture. Perfect for developing modern APIs with local & OAuth authentication, validation, logging, and production-ready setups.

![NestJS](https://img.shields.io/badge/NestJS-Backend-red) ![Prisma](https://img.shields.io/badge/Prisma-ORM-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📌 Features

✅ User registration and login with local authentication (email + password)  
✅ OAuth login support (Google, Github, etc.) with extensible strategy  
✅ Prisma ORM (PostgreSQL/SQLite)  
✅ Request validation using Zod  
✅ Structured logging with Winston  
✅ Clean and modular architecture (clean architecture)  
✅ Test service to support e2e testing

---

## 🗂️ Folder Structure

```

src/
├── auth/           # Endpoints and authentication logic
├── user/           # Endpoints and user logic
├── common/         # Shared services such as Prisma & Validation
├── model/          # DTOs and response models
└── app.module.ts

```

---

## ⚙️ How to Run the Project

1️⃣ Install dependencies
```bash
npm install
```

2️⃣ Generate Prisma Client

```bash
npx prisma generate
```

3️⃣ Run database migrations (optional, if using schema migrations)

```bash
npx prisma migrate dev
```

4️⃣ Start the development server

```bash
npm run start:dev
```

---

## 🧪 Testing

Run all unit & e2e tests:

```bash
npm run test
```




## 📬 Main Endpoints

* `POST /api/user/register` → Register a new user.
* `POST /api/auth/login` → Login using email & password.
* `POST /api/auth/oauth` → Login using a token from an OAuth provider (Google, Github, etc.).

---

## 🏗️ Main Modules

* **AuthModule**: local & OAuth authentication
* **UserModule**: user registration and management
* **CommonModule**: PrismaService, ValidationService, global logger
* **Model**: DTO and response definitions

---

## 🛡️ Security

* Passwords are stored hashed with bcrypt.
* Access tokens use JWT with configurable expiry.
* Rate limiting, helmet, and CORS can be added for production requirements.

---

## 📈 Contribution

Contributions are very welcome!
Feel free to fork this project, create a new branch for your feature/bugfix, and submit a pull request.

---

## 📄 License

This project is released under the [MIT License](./LICENSE) © 2025 Kikuk Afandi.