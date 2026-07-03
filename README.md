# RealEstate — Fullstack платформа недвижимости

Поиск, аренда и покупка недвижимости. Папки `backend/` и `frontend/` запускаются независимо.

## Быстрый старт

```bash
# 1) Backend
cd backend
cp .env.example .env
npm install
npm run seed         # заполнить демо-данными
npm run dev          # http://localhost:5000

# 2) Frontend (в другом терминале)
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

## Демо-учётки
- **Админ:** `admin@demo.com` / `Admin1234`
- **Пользователь:** `user@demo.com` / `User1234`

## Стек

**Backend:** Express, TypeScript, MongoDB/Mongoose, JWT (access+refresh), bcrypt, Helmet, CORS, rate-limit, mongo-sanitize, xss-clean, hpp, Zod.

**Frontend:** Vite, React 18, TypeScript, Tailwind CSS, React Router, Axios, lucide-react. Контексты `AuthContext` + `CartContext`.

## Структура

```
realestate/
├── backend/   # Express API
└── frontend/  # React SPA
```

См. README в каждой папке.
