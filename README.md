# 🔐 Alyra Lock — Zero-Knowledge Password Governance

<p align="center">
  <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/viktor/library%20icon.svg" width="120" alt="Alyra Lock Logo" />
</p>

<p align="center">
  <b>Military-Grade Client-Side Encryption • Zero Server Trust • Hardware-Level Password Security</b>
</p>

<p align="center">
  <a href="https://alyra-lock.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-alyra--lock.vercel.app-00F2FE?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://github.com/Silenttears-cloud/Zero-knowledge-password-manager-"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repo" /></a>
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-10B981?style=for-the-badge" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/Key%20Derivation-PBKDF2%20600K-7F00FF?style=for-the-badge" alt="PBKDF2" />
</p>

---

## 🌟 Overview

**Alyra Lock** is an open-source, enterprise-grade **Zero-Knowledge Password Manager** built for modern web security standards.

Unlike traditional password managers that rely on server-side decryption or trusted backends, **Alyra Lock performs 100% of cryptography client-side in your browser** using the Web Crypto API. Your master password and vault encryption keys never leave your machine — the backend server only ever receives and stores authenticated ciphertexts.

---

## ✨ Core Features

- 🛡️ **Zero Server Trust Architecture**: All vault items are encrypted and decrypted locally on your device via `AES-256-GCM` and `PBKDF2-HMAC-SHA256` (600,000 iterations).
- 🔑 **24-Character Emergency Recovery Kit**: Generated upon signup (`ALYRA-XXXX-YYYY-ZZZZ-WWWW`) to enable master password reset without sacrificing zero-knowledge privacy.
- ⚡ **Self-Destructing Share Links**: Share encrypted credentials via single-use URLs (`/share/[id]#[otkHex]`) where decryption keys are passed in the URL `#hash` fragment and never touch server logs.
- 📊 **Real-Time Security Intelligence Hub**: Dynamic SVG health ring audit gauge, password reuse detector, and k-anonymity HaveIBeenPwned breach vulnerability scanner.
- 🐙 **GitHub OAuth 2.0 Integration**: One-click authentication with GitHub.
- 🎨 **Motionsites AI Design System**: Built with `Inter` typography, clean `#F4F8F9` card surfaces, soft pastel mesh radial gradients, and interactive floating UI elements.

---

## 🔒 Security & Cryptographic Model

### 1. Key Derivation (PBKDF2-HMAC-SHA256)
When a user unlocks their vault, a 256-bit AES key is derived from their Master Password and a unique 16-byte cryptographically random `vaultSalt`:
```ts
derivedKey = PBKDF2(MasterPassword, vaultSalt, iterations=600000, keyLength=256, hash="SHA-256")
```

### 2. Domain Separation for Authentication (`authHash`)
To prevent the server from gaining information about the vault key, authentication hashes use domain-separated salt prefixes:
```ts
authHash = PBKDF2(MasterPassword, "zk-auth-" + vaultSalt, iterations=600000, keyLength=256, hash="SHA-256")
```

### 3. URL `#hash` Fragment Handoff
Zero-Knowledge share links format keys after the URL fragment identifier (`#`):
```
https://alyra-lock.vercel.app/share/64f1a9b2#3f8e91c4b...
```
According to HTTP specifications, browsers **never send `#hash` fragments in HTTP requests**. The server and edge proxies see only `/share/64f1a9b2`, keeping the decryption key entirely client-side.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4, Custom Motionsites AI Design System
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Cryptography**: Native Browser Web Crypto API (`crypto.subtle`)

### Backend
- **Runtime**: Node.js, TypeScript
- **Framework**: Express 5
- **Database**: MongoDB Atlas (Mongoose ORM)
- **Authentication**: JWT, Bcrypt, GitHub OAuth 2.0

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas cluster URI (or local MongoDB running on `mongodb://localhost:27017`)

### 1. Clone Repository
```bash
git clone https://github.com/Silenttears-cloud/Zero-knowledge-password-manager-.git
cd Zero-knowledge-password-manager-
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_secure_jwt_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Run the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

Run the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/salt/:email` | Fetch user's public `vaultSalt` for client key derivation |
| `POST` | `/api/auth/signup` | Register new user with `authHash`, `vaultSalt`, and `recoveryHash` |
| `POST` | `/api/auth/login` | Authenticate user via `authHash` and return JWT token |
| `POST` | `/api/auth/reset-password` | Reset Master Password using 24-character Emergency Key |
| `POST` | `/api/auth/reset-account` | Reset account and wipe un-decryptable vault entries |
| `DELETE`| `/api/auth/purge-all-data` | Permanent database purge endpoint |
| `GET` | `/api/vault` | Retrieve encrypted vault payload for authenticated user |
| `POST` | `/api/vault` | Create/update encrypted vault entry |

---

## 👥 Authors & Contributors

- **Ayushi Raj** ([@Silenttears-cloud](https://github.com/Silenttears-cloud))
- **Roushan Kumar** ([@Hey-Astreon](https://github.com/Hey-Astreon))

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
