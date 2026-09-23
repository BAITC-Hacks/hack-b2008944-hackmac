import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { ALL_PRODUCTS, CITIES } from './src/data/mockProducts.ts';
import { Product } from './src/types/index.ts';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt with catalog knowledge
const CATALOG_SUMMARY = ALL_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  article: p.article,
  price: p.price,
  brand: p.brand,
  category: p.category,
  current: p.current,
  poles: p.poles,
  breakingCapacity: p.breakingCapacity,
  voltage: p.voltage,
  qtyАстана: p.stores?.find((s) => s.name === 'Астана')?.quantity || 0,
  qtyAlmaty: p.stores?.find((s) => s.name === 'Алматы')?.quantity || 0,
  totalQty: p.quantity,
}));

const SYSTEM_INSTRUCTION = `
Ты — старший ведущий инженер-консультант интернет-магазина электротехники EKT (сайт https://Астана.ekt.kz/, филиалы в Астанае, Алматы, Шымкенте, Караганде и других городах Казахстана).

Твоя цель:
1. Помогать клиентам (электрикам, проектировщикам, монтажникам, снабженцам и частным клиентам) профессионально подбирать электрооборудование БЕЗ участия живого менеджера.
2. Делать точные инженерные расчеты:
   - Расчет тока по мощности нагрузки:
     * Однофазная сеть 220В: I = P / (220 * cos φ). Пример: для 5 кВт (cos φ = 0.9) ток ~25А (автомат C25, провод ВВГнг-Ls 3x4 мм²).
     * Трехфазная сеть 380В: I = P / (√3 * 380 * cos φ) = P / (658 * cos φ). Пример: для 30 кВт ток ~50-55А (автомат на 63А, например Legrand DRX125 3ф 63A или 80A).
   - Подбор автоматических выключателей:
     * Серия Legrand DRX125: от 10А до 125А (10kA или 20kA).
     * Серия Legrand DRX250: от 125А до 250А (18kA или 25kA). Номиналы: 125A, 160A, 200A, 250A.
   - Подбор реле контроля Schneider Electric:
     * Для насосов: RM35BA10 (контроль 1 и 3 фаз, асимметрия, сухой ход, 208...480VAC).
     * Для защиты бытовой и офисной сети: RM17UBE15 (65...260V), RM22UB34 (80...300V 8A 2CO).
   - Диф. защита:
     * Legrand 1P+N 16A 30mA (арт. 007886) — защита розеток от утечки тока и КЗ.
   - Светильники OPPLE и лампы MEGALIGHT для складов и офисов.

3. Проверять реальное наличие на складах:
   - Основной склад в Астанае (ул. Бейсекбаева 24/1), Алматы, Шымкент, Караганда и др.

4. Формат ответа:
   - Отвечай вежливо, четко и технически грамотно на русском языке (или на казахском, если клиент пишет на казахском).
   - Включай конкретные формулы, сечения кабелей и рекомендации по установке при необходимости.
   - Обязательно укажи список точных ID рекомендованных товаров из каталога EKT в формате JSON-блока в конце:
   \`\`\`json
   {
     "suggestedProductIds": [515291, 515288],
     "calculatedCurrent": 52.4,
     "recommendedRating": "63А"
   }
   \`\`\`

Доступные товары в магазине EKT:
${JSON.stringify(CATALOG_SUMMARY, null, 2)}
`;

// Helper for fallback rule-based expert consultant if Gemini API is unavailable or limits exceeded
function ruleBasedConsultant(userPrompt: string): {
  text: string;
  suggestedProductIds: number[];
} {
  const p = userPrompt.toLowerCase();
  let matchedIds: number[] = [];
  let answer = '';

  if (p.includes('насос') || p.includes('скважин') || p.includes('сухого хода')) {
    matchedIds = [35604, 35574, 35581];
    answer = `⚡ **Для защиты электродвигателя насоса рекомендуется специализированное реле контроля RM35BA10 от Schneider Electric!**

**Почему именно оно:**
1. **Защита от сухого хода** — контролирует фазовый сдвиг (cos φ), моментально отключая насос при падении уровня воды.
2. **Контроль чередования и обрыва фаз** — исключает вращение насоса в обратную сторону и перегрев обмоток.
3. Диапазон питания: **208...480 В AC**, нагрузочная способность контакта 5А (для подключения катушки контактора).
4. Товар есть в наличии на складе в Астанае!`;
  } else if (p.includes('160') || (p.includes('автомат') && p.includes('силов'))) {
    matchedIds = [515291, 515288, 515290];
    answer = `⚡ **По вашему запросу на 160А рекомендую силовые автоматические выключатели Legrand DRX250 MT (3 полюса):**

1. **027228 Legrand DRX250 MT 3ф 160А 18kA** — цена **64 920 ₸**.
   - На складе в **Астанае: 8 шт.**, Алматы: 5 шт. (всего 23 шт. по РК).
   - Отключающая способность 18 кА — оптимально для большинства распределительных шкафов ВРУ.
2. **027230 Legrand DRX250 MT 3ф 160А 25kA** — цена **65 920 ₸**.
   - Для объектов вблизи трансформаторных подстанций (ТП) с повышенными токами КЗ (25 кА).
   - В наличии в Астанае: 6 шт.

Рекомендуемое сечение медного кабеля: **70 мм²** (или 2х35 мм²).`;
  } else if (p.includes('диф') || p.includes('узо') || p.includes('утечк') || p.includes('квартир')) {
    matchedIds = [25397, 58412, 58379];
    answer = `🛡️ **Для защиты розеточных групп и человека от поражения током:**

Рекомендуем **Дифференциальный автомат Legrand 1P+N 16А (30мА) арт. 411002** (цена **9 430 ₸**).
- Совмещает в одном модуле автоматический выключатель на 16А и УЗО с током утечки 30мА.
- Обязателен по ПУЭ РК для розеточных линий кухни, ванной и жилых комнат.
- В наличии на складе в Астанае (18 шт.).`;
  } else if (p.includes('реле') || p.includes('напряжен') || p.includes('скач')) {
    matchedIds = [35581, 35574, 35563, 35600];
    answer = `🛡️ **Для защиты от скачков и просадок напряжения в сети 220В:**

1. **Schneider Electric RM22UB34 (8А, 2 CO, 80…300 V AC/DC)** — цена **35 730 ₸**.
   - 2 перекидных контакта, выдержка времени от 0.1 до 30 секунд.
2. **Schneider Electric RM17UAS15 (65…260 V AC/DC)** — цена **43 250 ₸**.
   - Компактный размер 17.5 мм на DIN-рейку.
   - В наличии на складе в Астанае!`;
  } else if (p.includes('квт') || p.includes('мощност') || p.includes('расчет') || p.includes('нагрузк')) {
    matchedIds = [515285, 515277, 515278, 515291];
    answer = `⚡ **Инженерный расчет номинала автоматического выключателя:**

Формула для 3-фазной сети (380В):
$$I = \\frac{P}{\\sqrt{3} \\times 380 \\times \\cos \\varphi}$$
Принимая стандартный $\\cos \\varphi \\approx 0.85$:
- **15 кВт** $\\rightarrow$ рабочий ток $\\approx 27А$ $\\rightarrow$ Автомат **32А** или **40А** (Legrand DRX125 40A).
- **30 кВт** $\\rightarrow$ рабочий ток $\\approx 54А$ $\\rightarrow$ Автомат **63А** (Legrand DRX125 63A арт. 027220, цена 31 620 ₸).
- **50 кВт** $\\rightarrow$ рабочий ток $\\approx 90А$ $\\rightarrow$ Автомат **100А** (Legrand DRX125 100A, цена 29 190 ₸).
- **80-90 кВт** $\\rightarrow$ рабочий ток $\\approx 145А$ $\\rightarrow$ Автомат **160А** (Legrand DRX250 160A, цена 64 920 ₸).

Все указанные силовые выключатели есть в наличии в Астанае!`;
  } else if (p.includes('свет') || p.includes('ламп') || p.includes('офис') || p.includes('склад')) {
    matchedIds = [45357, 19988, 25010];
    answer = `💡 **Для освещения помещений и складов:**

1. **LED STARK 30W 2400Lm MEGALIGHT** — цена **1 810 ₸** (мощная лампа для высоких пролетов).
2. **Накладной светильник OPPLE 21W 6500K** — цена **2 710 ₸**.
3. **Потолочный светильник OPPLE 38W 6500K** — цена **3 595 ₸**.
Большой складской запас в Астанае и Алматы.`;
  } else if (p.includes('астан') || p.includes('Астана') || p.includes('наличи')) {
    matchedIds = [515291, 515285, 25397, 45357];
    answer = `📦 **Наличие товаров на складе в Астанае (ул. Бейсекбаева 24/1):**

- **Автомат Legrand DRX250 160A 18kA**: 8 шт. в наличии (отгрузка в день заказа).
- **Автомат Legrand DRX125 63A 20kA**: 10 шт. в наличии.
- **Диф. автомат Legrand 16A 30mA**: 18 шт. в наличии.
- **Светильники и коробки**: более 100 шт. на складе.
Доступен самовывоз с 9:00 до 18:00 или экспресс-доставка по городу за 2 часа!`;
  } else {
    matchedIds = [515291, 515285, 35604, 25397];
    answer = `Здравствуйте! Я — **ИИ-инженер EKT.KZ**. 

Чем я могу помочь вам прямо сейчас:
1. ⚡ **Подобрать автоматический выключатель** по мощности (кВт) или номиналу тока (16А - 250А).
2. 🛡️ **Подобрать реле контроля напряжения** или защиту электродвигателей/насосов.
3. 📦 **Проверить остатки на складе** в Астанае или Алматы.
4. 📋 **Сформировать коммерческое предложение** (КП) для вашей компании (ТОО/ИП).

Напишите вашу задачу или мощность оборудования!`;
  }

  return { text: answer, suggestedProductIds: matchedIds };
}

// API Routes
// Chat endpoint with Gemini AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (ai) {
      try {
        const prompt = `Пользователь спрашивает: "${message}". 
История предыдущего диалога: ${JSON.stringify(history || [])}.
Ответь как инженер EKT, порекомендуй товары из каталога с ID, ценами и наличием.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const rawText = response.text || '';

        // Extract JSON block if present
        let suggestedProductIds: number[] = [];
        let cleanText = rawText;

        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (Array.isArray(parsed.suggestedProductIds)) {
              suggestedProductIds = parsed.suggestedProductIds;
            }
            cleanText = rawText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
          } catch (e) {
            console.error('Failed to parse JSON block from Gemini:', e);
          }
        }

        // If no product IDs were parsed, match based on mentioned names/articles
        if (suggestedProductIds.length === 0) {
          for (const item of ALL_PRODUCTS) {
            if (
              cleanText.includes(item.article) ||
              cleanText.includes(String(item.id)) ||
              (item.current && cleanText.includes(item.current) && cleanText.includes(item.brand || ''))
            ) {
              suggestedProductIds.push(item.id);
            }
          }
          suggestedProductIds = suggestedProductIds.slice(0, 4);
        }

        // Fallback to relevant items if still empty
        if (suggestedProductIds.length === 0) {
          const fallback = ruleBasedConsultant(message);
          suggestedProductIds = fallback.suggestedProductIds;
        }

        res.json({
          reply: cleanText,
          suggestedProductIds,
          timestamp: new Date().toISOString(),
        });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to expert rule engine:', geminiError?.message || geminiError);
      }
    }

    // Fallback if AI not configured or call failed
    const fallbackResponse = ruleBasedConsultant(message);
    res.json({
      reply: fallbackResponse.text,
      suggestedProductIds: fallbackResponse.suggestedProductIds,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Server error processing chat message' });
  }
});

// Products listing endpoint with pagination and filters
app.get('/api/products', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const per_page = parseInt(req.query.per_page as string) || 20;
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const category = (req.query.category as string) || '';
    const brand = (req.query.brand as string) || '';
    const current = (req.query.current as string) || '';
    const poles = (req.query.poles as string) || '';
    const breakingCapacity = (req.query.breakingCapacity as string) || '';
    const city = (req.query.city as string) || 'Астана';
    const inStockOnly = req.query.inStockOnly === 'true';
    const sortBy = (req.query.sortBy as string) || 'relevance';

    let filtered = [...ALL_PRODUCTS];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.article.toLowerCase().includes(search) ||
          (p.brand && p.brand.toLowerCase().includes(search)) ||
          (p.description && p.description.toLowerCase().includes(search))
      );
    }

    if (category && category !== 'Все категории') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (brand && brand !== 'Все бренды') {
      filtered = filtered.filter((p) => p.brand === brand);
    }

    if (current && current !== 'Все номиналы') {
      filtered = filtered.filter((p) => p.current === current || p.name.includes(current));
    }

    if (poles && poles !== 'Любое') {
      filtered = filtered.filter((p) => p.poles === poles);
    }

    if (breakingCapacity && breakingCapacity !== 'Любая') {
      filtered = filtered.filter(
        (p) =>
          p.breakingCapacity === breakingCapacity ||
          p.name.toLowerCase().includes(breakingCapacity.toLowerCase().replace(' ', ''))
      );
    }

    if (inStockOnly) {
      const cityObj = CITIES.find((c) => c.id === city) || CITIES[0];
      filtered = filtered.filter((p) => {
        const store = p.stores?.find((s) => s.name === cityObj.storeName);
        return store ? store.quantity > 0 : (p.quantity || 0) > 0;
      });
    }

    // Sorting
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * per_page;
    const items = filtered.slice(startIndex, startIndex + per_page);

    res.json({
      page,
      per_page,
      count: items.length,
      total,
      items,
    });
  } catch (err: any) {
    console.error('Products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Single product detail endpoint with warehouse inventory
app.get('/api/products/detail', (req, res) => {
  try {
    const id = parseInt(req.query.id as string);
    if (!id) {
      res.status(400).json({ error: 'Product ID required' });
      return;
    }

    const product = ALL_PRODUCTS.find((p) => p.id === id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (err: any) {
    console.error('Product detail error:', err);
    res.status(500).json({ error: 'Failed to fetch product detail' });
  }
});

// Cities listing
app.get('/api/cities', (req, res) => {
  res.json(CITIES);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} (0.0.0.0)`);
  });
}

startServer();
