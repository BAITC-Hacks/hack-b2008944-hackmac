# ⚡ EKT.KZ — Редизайн и Интеллектуальный ИИ-Инженер Консультант

> Проект разработан командой из трех специалистов для хакатона EKT.KZ.

---

## 👥 Команда проекта (Разделение на 3 разработчиков)

| Роль | Зона ответственности | Ключевые файлы |
| :--- | :--- | :--- |
| **Backend-разработчик** | REST API Express, архитектура данных, фильтрация, складской учет по городам РК (Астана, Алматы, Шымкент), пагинация | `server.ts`<br>`src/data/mockProducts.ts`<br>`src/types/index.ts`<br>`src/services/api.ts` |
| **Frontend-разработчик** | Пользовательский интерфейс, адаптивный UI/UX, каталог товаров, корзина, расчет сметы с НДС 12%, печать КП, калькулятор кВт↔А | `src/App.tsx`<br>`src/components/Header.tsx`<br>`src/components/CatalogSection.tsx`<br>`src/components/ProductCard.tsx`<br>`src/components/CartModal.tsx`<br>`src/components/ElectricalCalculatorModal.tsx`<br>`src/components/Footer.tsx` |
| **AI-инженер (ИИ-помощник)** | Ядро умного консультанта EKT, база инженерных знаний по ПУЭ РК, интеграция Gemini API, экспертные правила подбора автоматов Legrand DRX и реле Schneider, голосовой ввод | `src/components/AIConsultantChat.tsx`<br>`src/services/aiConsultant.ts`<br>`server.ts` (Gemini API маршрут) |

Подробное описание вклада каждого участника доступно в файле [`TEAM.md`](./TEAM.md).

---

## 💻 Инструкция: Как открыть и запустить проект в Visual Studio Code

### 1. Открытие папки в VS Code
1. Запустите программу **Visual Studio Code**.
2. В строке меню нажмите: **File** ➔ **Open Folder...** (или нажмите `Ctrl + O` / `Cmd + O`).
3. Выберите папку с этим проектом.
   *(Либо в терминале перейдите в папку и выполните команду `code .`)*

### 2. Открытие терминала
- Нажмите комбинацию клавиш: **`Ctrl + ~`** (тильда)
- Или в меню выберите: **Terminal** ➔ **New Terminal**.

### 3. Установка пакетов
Выполните команду в терминале:
```bash
npm install
```

### 4. Запуск сервера разработки
Выполните команду:
```bash
npm run dev
```

### 5. Открытие в браузере
Перейдите по адресу:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠 Технологический стек
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **ИИ-помощник:** Google Gemini API (`@google/genai`) + автономный инженерный движок расчетов по ПУЭ РК.
