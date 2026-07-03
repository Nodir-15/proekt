import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user";
import { Product } from "../models/products";

const mockProducts = (ownerId: string) => [
  {
    title: "Современная квартира в центре",
    description: "Светлая 2-комнатная квартира с панорамными окнами и видом на парк.",
    price: 320000, transactionType: "sale", category: "apartment",
    area: 78, bedrooms: 2, bathrooms: 1,
    location: { city: "Москва", address: "ул. Тверская, 12" },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
    ],
    amenities: ["Балкон", "Парковка", "Лифт"], status: "available", owner: ownerId,
  },
  {
    title: "Уютный дом с садом",
    description: "Двухэтажный дом 180 м² с ландшафтным садом и гаражом.",
    price: 750000, transactionType: "sale", category: "house",
    area: 180, bedrooms: 4, bathrooms: 3,
    location: { city: "Подмосковье", address: "пос. Барвиха, 5" },
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200",
    ],
    amenities: ["Сад", "Гараж", "Камин"], status: "available", owner: ownerId,
  },
  {
    title: "Лофт в индустриальном стиле",
    description: "Высокие потолки, кирпичные стены, открытая планировка.",
    price: 2500, transactionType: "rent", category: "apartment",
    area: 95, bedrooms: 1, bathrooms: 1,
    location: { city: "Санкт-Петербург", address: "наб. Обводного канала, 60" },
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200"],
    amenities: ["Wi-Fi", "Кондиционер"], status: "available", owner: ownerId,
  },
  {
    title: "Таунхаус в новом квартале",
    description: "Современный таунхаус 140 м² с террасой.",
    price: 480000, transactionType: "sale", category: "townhouse",
    area: 140, bedrooms: 3, bathrooms: 2,
    location: { city: "Казань", address: "ЖК Лесная Поляна, д. 8" },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"],
    amenities: ["Терраса", "Парковка"], status: "available", owner: ownerId,
  },
  {
    title: "Офис класса А",
    description: "Коммерческое помещение 220 м² в бизнес-центре.",
    price: 5800, transactionType: "rent", category: "commercial",
    area: 220, bedrooms: 0, bathrooms: 2,
    location: { city: "Москва", address: "Москва-Сити, башня Федерация" },
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200"],
    amenities: ["Охрана 24/7", "Парковка", "Переговорные"], status: "available", owner: ownerId,
  },
  {
    title: "Студия у моря",
    description: "Аренда студии 35 м² в 5 минутах от пляжа.",
    price: 900, transactionType: "rent", category: "apartment",
    area: 35, bedrooms: 1, bathrooms: 1,
    location: { city: "Сочи", address: "ул. Приморская, 24" },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"],
    amenities: ["Wi-Fi", "Кондиционер", "Балкон"], status: "available", owner: ownerId,
  },
  {
    title: "Вилла премиум-класса",
    description: "Роскошная вилла 420 м² с бассейном и видом на горы.",
    price: 2400000, transactionType: "sale", category: "house",
    area: 420, bedrooms: 6, bathrooms: 5,
    location: { city: "Красная Поляна", address: "ул. Эстосадок, 17" },
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200"],
    amenities: ["Бассейн", "Сауна", "Гараж"], status: "available", owner: ownerId,
  },
  {
    title: "Двухкомнатная для семьи",
    description: "Светлая квартира в новом ЖК, рядом школа и парк.",
    price: 1500, transactionType: "rent", category: "apartment",
    area: 62, bedrooms: 2, bathrooms: 1,
    location: { city: "Екатеринбург", address: "ул. Малышева, 84" },
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"],
    amenities: ["Парковка", "Детская площадка"], status: "available", owner: ownerId,
  },
  {
    title: "Таунхаус с собственным двором",
    description: "3 этажа, гараж на 2 машины, патио.",
    price: 3200, transactionType: "rent", category: "townhouse",
    area: 175, bedrooms: 4, bathrooms: 3,
    location: { city: "Новосибирск", address: "ул. Кошурникова, 5" },
    images: ["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200"],
    amenities: ["Гараж", "Патио", "Камин"], status: "available", owner: ownerId,
  },
  {
    title: "Помещение под ресторан",
    description: "Готовое помещение 180 м² на первой линии.",
    price: 410000, transactionType: "sale", category: "commercial",
    area: 180, bedrooms: 0, bathrooms: 2,
    location: { city: "Москва", address: "ул. Пятницкая, 41" },
    images: ["https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200"],
    amenities: ["Вытяжка", "Витрина"], status: "available", owner: ownerId,
  },
  {
    title: "Дом в скандинавском стиле",
    description: "Деревянный дом 160 м² с большими окнами.",
    price: 540000, transactionType: "sale", category: "house",
    area: 160, bedrooms: 3, bathrooms: 2,
    location: { city: "Калининград", address: "пос. Янтарный, 12" },
    images: ["https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=1200"],
    amenities: ["Камин", "Сад"], status: "available", owner: ownerId,
  },
  {
    title: "Пентхаус с террасой",
    description: "Эксклюзивный пентхаус 250 м² с террасой 80 м².",
    price: 4200, transactionType: "rent", category: "apartment",
    area: 250, bedrooms: 4, bathrooms: 3,
    location: { city: "Москва", address: "Пресненская наб., 6" },
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"],
    amenities: ["Терраса", "Джакузи", "Консьерж"], status: "available", owner: ownerId,
  },
];

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
  const admin = await User.create({
    name: "Admin", email: "admin@demo.com", password: "Admin1234", role: "admin",
  });
  await User.create({ name: "Demo User", email: "user@demo.com", password: "User1234" });
  await Product.insertMany(mockProducts(admin.id) as any);
  console.log("✅ Seeded. admin@demo.com / Admin1234, user@demo.com / User1234");
  await mongoose.disconnect();
})();