
🇬🇧 [Read English Version](./README.md)
<p align="center">
  <img src="https://blogger.googleusercontent.com/img/a/AVvXsEjWze3a-83ZfufvHCwCXUbJArVFOISUVf66dGYHaQ6MknBalveNaaGK-N-0I4ZegpcK-Z6haxg5baB0IZabMsI3DivSamutVh_EOM38KVNYgrTCXA1aBeAWib9tg6gx_NJc3caOzq9EA9ryiexN5MgNehHotbr_gUvSpgYVNvwOMmTeWS1A2E1CH_9ooBBj" alt="Nest Zero Logo" width="300"/>
</p>

# 🚀 Nest Zero

Starter project modular berbasis [NestJS](https://nestjs.com/) + [Prisma ORM](https://www.prisma.io/) dengan arsitektur clean dan extensible. Cocok untuk kebutuhan pengembangan API modern dengan autentikasi lokal & OAuth, validasi, logging, dan siap digunakan di environment production.

![NestJS](https://img.shields.io/badge/NestJS-Backend-red) ![Prisma](https://img.shields.io/badge/Prisma-ORM-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

##  Fitur

✅ Register dan login user dengan autentikasi lokal (email + password)  
✅ Dukungan login OAuth (Google, Github, dsb) dengan extensible strategy  
✅ Prisma ORM (PostgreSQL/SQLite)  
✅ Validasi request dengan Zod  
✅ Logging terstruktur dengan Winston  
✅ Arsitektur modular & bersih (clean architecture)  
✅ Test service untuk mendukung e2e testing



## 🗂️ Struktur Folder

```

src/
├── auth/           # Endpoint dan logic autentikasi
├── user/           # Endpoint dan logic user
├── common/         # Shared services seperti Prisma & Validation
├── model/          # DTO dan response models
└── app.module.ts

```

---

## ⚙️ Cara Jalankan Proyek

1️⃣ Install dependencies
```bash
npm install
```

2️⃣ Generate Prisma Client

```bash
npx prisma generate
```

3️⃣ Jalankan migration database (opsional, jika pakai migrasi schema)

```bash
npx prisma migrate dev
```

4️⃣ Jalankan server development

```bash
npm run start:dev
```



## 🧪 Testing

Jalankan seluruh unit & e2e test:

```bash
npm run test
```



## 📬 Endpoint Utama

* `POST /api/user/register` → Register user baru.
* `POST /api/auth/login` → Login dengan email & password.
* `POST /api/auth/oauth` → Login menggunakan token dari OAuth provider (Google, Github, dsb).



## 🏗️ Modul Utama

* **AuthModule**: autentikasi local & oauth
* **UserModule**: registrasi dan manajemen user
* **CommonModule**: PrismaService, ValidationService, logger global
* **Model**: definisi DTO & response



## 🛡️ Keamanan

* Password disimpan dengan hash bcrypt.
* Token akses menggunakan JWT dengan expiry configurable.
* Rate limiting, helmet, dan CORS bisa ditambahkan untuk kebutuhan produksi.



## 📈 Contribusi

Kontribusi sangat terbuka!
Silakan fork project ini, buat branch baru untuk fitur/bugfix, dan kirimkan pull request.

## 📄 Lisensi

Proyek ini dirilis dengan [MIT License](./LICENSE) © 2025 Kikuk Afandi.
