package com.example.data.model

object EctCatalogData {
    val products: List<Product> = listOf(
        // --- Кабель и провод ---
        Product(
            id = "ECT-CBL-001",
            name = "Кабель силовой ВВГнг(А)-LS 3х2.5 ГОСТ",
            category = ProductCategory.CABLE,
            brand = "Казэнергокабель",
            article = "KEK-VVG-3X25",
            priceKzt = 485,
            unit = "м",
            specs = mapOf(
                "Количество жил" to "3",
                "Сечение жилы" to "2.5 мм²",
                "Материал" to "Медь (Cu)",
                "Изоляция" to "ПВХ пониженной пожароопасности (LS)",
                "Номинальное напряжение" to "660 В",
                "Стандарт" to "ГОСТ 31996-2012"
            ),
            description = "Медный кабель для розеточных групп жилых и общественных зданий. Не распространяет горение при групповой прокладке.",
            popularBadge = "Хит продаж"
        ),
        Product(
            id = "ECT-CBL-002",
            name = "Кабель силовой ВВГнг(А)-LS 3х1.5 ГОСТ",
            category = ProductCategory.CABLE,
            brand = "Казэнергокабель",
            article = "KEK-VVG-3X15",
            priceKzt = 310,
            unit = "м",
            specs = mapOf(
                "Количество жил" to "3",
                "Сечение жилы" to "1.5 мм²",
                "Материал" to "Медь (Cu)",
                "Изоляция" to "ПВХ пониженной пожароопасности",
                "Номинальное напряжение" to "660 В",
                "Стандарт" to "ГОСТ 31996-2012"
            ),
            description = "Оптимальный медный кабель для групп освещения и слаботочных цепей.",
            popularBadge = "Для освещения"
        ),
        Product(
            id = "ECT-CBL-003",
            name = "Кабель силовой ВВГнг(А)-LS 3х6 ГОСТ (для электроплит)",
            category = ProductCategory.CABLE,
            brand = "Казэнергокабель",
            article = "KEK-VVG-3X6",
            priceKzt = 1150,
            unit = "м",
            specs = mapOf(
                "Количество жил" to "3",
                "Сечение жилы" to "6.0 мм²",
                "Материал" to "Медь (Cu)",
                "Максимальная нагрузка" to "до 10 кВт (46 А)",
                "Стандарт" to "ГОСТ 31996-2012"
            ),
            description = "Усиленный силовой медный кабель для подключения индукционных варочных панелей, электроплит и проточных водонагревателей.",
            popularBadge = "Для варочных панелей"
        ),
        Product(
            id = "ECT-CBL-004",
            name = "Провод самонесущий изолированный СИП-4 4х16",
            category = ProductCategory.CABLE,
            brand = "Энергопром",
            article = "EN-SIP4-4X16",
            priceKzt = 720,
            unit = "м",
            specs = mapOf(
                "Количество жил" to "4",
                "Сечение жилы" to "16 мм²",
                "Материал" to "Алюминий (Al)",
                "Назначение" to "Ввод от столба ВЛ в частный дом 380В",
                "Изоляция" to "Светостабилизированный сшитый полиэтилен"
            ),
            description = "Для воздушных ответвлений от магистральных воздушных линий 0.4 кВ к вводу в жилые дома и хозпостройки."
        ),
        Product(
            id = "ECT-CBL-005",
            name = "Провод соединительный ПВС 3х2.5 гибкий",
            category = ProductCategory.CABLE,
            brand = "Казэнергокабель",
            article = "KEK-PVS-3X25",
            priceKzt = 520,
            unit = "м",
            specs = mapOf(
                "Количество жил" to "3",
                "Сечение жилы" to "2.5 мм²",
                "Класс гибкости" to "5 (многопроволочная жила)",
                "Назначение" to "Удлинители, подключение электроинструмента"
            ),
            description = "Гибкий провод со скрученными медными жилами для изготовления удлинителей и подключения бытовой техники."
        ),

        // --- Модульная автоматика ---
        Product(
            id = "ECT-AUT-001",
            name = "Автоматический выключатель CHINT eB 1P 16A (C) 4.5kA",
            category = ProductCategory.MODULAR_AUTOMATION,
            brand = "CHINT",
            article = "CHINT-187056",
            priceKzt = 1250,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "16 А",
                "Количество полюсов" to "1P",
                "Характеристика расцепления" to "C",
                "Отключающая способность" to "4.5 кА",
                "Крепление" to "DIN-рейка (1 модуль)"
            ),
            description = "Надежный однополюсный автомат для защиты бытовых розеточных линий. Высокая износостойкость.",
            popularBadge = "Топ выбор"
        ),
        Product(
            id = "ECT-AUT-002",
            name = "Автоматический выключатель CHINT eB 1P 10A (C) 4.5kA",
            category = ProductCategory.MODULAR_AUTOMATION,
            brand = "CHINT",
            article = "CHINT-187054",
            priceKzt = 1250,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "10 А",
                "Количество полюсов" to "1P",
                "Характеристика расцепления" to "C",
                "Отключающая способность" to "4.5 кА",
                "Крепление" to "DIN-рейка (1 модуль)"
            ),
            description = "Модульный автомат для цепей освещения жилых квартир и офисов."
        ),
        Product(
            id = "ECT-AUT-003",
            name = "Автоматический выключатель IEK ВА47-29 1P 32A (C) 4.5kA",
            category = ProductCategory.MODULAR_AUTOMATION,
            brand = "IEK",
            article = "MVA20-1-032-C",
            priceKzt = 1450,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "32 А",
                "Полюса" to "1P",
                "Кривая отключения" to "C",
                "Назначение" to "Плиты, варочные панели 7-7.5 кВт"
            ),
            description = "Автомат повышенной мощности под кабель 3х6 мм² для питания электрических варочных поверхностей."
        ),
        Product(
            id = "ECT-AUT-004",
            name = "УЗО электромеханическое IEK ВД1-63 2P 40A 30мА",
            category = ProductCategory.MODULAR_AUTOMATION,
            brand = "IEK",
            article = "MDV10-2-040-030",
            priceKzt = 6800,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "40 А",
                "Ток утечки" to "30 мА",
                "Тип срабатывания" to "AC (электромеханическое)",
                "Полюса" to "2P (фаза + ноль)",
                "Ширина" to "2 модуля (36 мм)"
            ),
            description = "Защита человека от поражения электрическим током при прямом или косвенном прикосновении. Не зависит от напряжения сети.",
            popularBadge = "Безопасность"
        ),
        Product(
            id = "ECT-AUT-005",
            name = "Дифференциальный автомат DEKraft ДИФ-103 2P 16A 30мА (C)",
            category = ProductCategory.MODULAR_AUTOMATION,
            brand = "DEKraft",
            article = "DK-13024DEK",
            priceKzt = 4900,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "16 А",
                "Ток утечки" to "30 мА",
                "Характеристика" to "C",
                "Функции" to "Автомат + УЗО в одном корпусе (2 модуля)"
            ),
            description = "Компактный АВДТ защищает линию одновременно от короткого замыкания, перегрузки и токов утечки (стиральная машина, посудомойка)."
        ),
        Product(
            id = "ECT-AUT-006",
            name = "Реле контроля напряжения 1-фазное 63А с вольтметром",
            category = ProductCategory.MODULAR_AUTOMATION,
            brand = "TDM Electric",
            article = "SQ1508-0001",
            priceKzt = 8900,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "63 А",
                "Индикация" to "Цифровой дисплей (вольтметр + амперметр)",
                "Диапазон защиты" to "140 В – 300 В",
                "Время задержки включения" to "регулируемое 1-500 сек"
            ),
            description = "Защищает всю технику в квартире (холодильник, ТВ, компьютеры) от скачков и обрыва нуля при авариях в электросети.",
            popularBadge = "Защита техники"
        ),
        Product(
            id = "ECT-AUT-007",
            name = "Автоматический выключатель Schneider Acti9 iC60N 3P 25A (C)",
            category = ProductCategory.MODULAR_AUTOMATION,
            brand = "Schneider Electric",
            article = "A9F74325",
            priceKzt = 14200,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "25 А",
                "Полюса" to "3P (трехфазный)",
                "Отключающая способность" to "6 кА",
                "Серия" to "Премиум индустриальная Acti9"
            ),
            description = "Премиальный трехфазный автомат для ввода 380В в коттеджи и промышленные объекты."
        ),

        // --- Щиты и боксы ---
        Product(
            id = "ECT-PNL-001",
            name = "Бокс пластиковый навесной IEK ЩРН-П 24 модуля IP41",
            category = ProductCategory.PANELS_BOXES,
            brand = "IEK",
            article = "MKP12-N-24-40-20",
            priceKzt = 5400,
            unit = "шт",
            specs = mapOf(
                "Вместимость" to "24 модуля (2 ряда по 12)",
                "Способ монтажа" to "Навесной (на стену)",
                "Степень защиты" to "IP41",
                "Дверца" to "Тонированная полупрозрачная",
                "Комплектация" to "DIN-рейки, шины N и PE, маркировка"
            ),
            description = "Удобный распределительный щит для 2-3 комнатной квартиры. Прочный ABS пластик, легкий ввод кабелей."
        ),
        Product(
            id = "ECT-PNL-002",
            name = "Щит металлический распределительный ЩРн-36з-1 IP31",
            category = ProductCategory.PANELS_BOXES,
            brand = "TDM Electric",
            article = "SQ0905-0014",
            priceKzt = 12600,
            unit = "шт",
            specs = mapOf(
                "Вместимость" to "36 модулей",
                "Материал" to "Листовая сталь с порошковой покраской",
                "Замок" to "Металлический замок с ключами в комплекте",
                "Габариты" to "540х310х120 мм"
            ),
            description = "Вместительный антивандальный щит для коттеджа, подъезда или производственного цеха."
        ),
        Product(
            id = "ECT-PNL-003",
            name = "Счетчик электроэнергии Энергомера СЕ101 R5 230В 5-60А 1-фазный",
            category = ProductCategory.PANELS_BOXES,
            brand = "Энергомера",
            article = "EM-CE101-R5",
            priceKzt = 9800,
            unit = "шт",
            specs = mapOf(
                "Тип" to "1-фазный многотарифный/однотарифный",
                "Номинальный ток" to "5 (60) А",
                "Крепление" to "На DIN-рейку",
                "Сертификат" to "Внесен в реестр средств измерений РК"
            ),
            description = "Учет активной электроэнергии в однофазных двухпроводных цепях переменного тока."
        ),

        // --- Светотехника ---
        Product(
            id = "ECT-LGT-001",
            name = "Светодиодная панель LED 36W 595х595 4000K (в Армстронг)",
            category = ProductCategory.LIGHTING,
            brand = "Jazzway",
            article = "JW-LP-36W-4K",
            priceKzt = 3900,
            unit = "шт",
            specs = mapOf(
                "Мощность" to "36 Вт",
                "Световой поток" to "3200 Лм",
                "Цветовая температура" to "4000K (нейтральный белый)",
                "Размер" to "595х595х19 мм",
                "Рассеиватель" to "Призма (минимальный коэффициент пульсации <1%)"
            ),
            description = "Энергоэффективная замена светильников ЛВО 4х18. Идеально для офисов, больниц, школ и магазинов."
        ),
        Product(
            id = "ECT-LGT-002",
            name = "Прожектор светодиодный уличный LED SMD 100W IP65 6500K",
            category = ProductCategory.LIGHTING,
            brand = "Feron",
            article = "FR-LL-100W-65K",
            priceKzt = 7800,
            unit = "шт",
            specs = mapOf(
                "Мощность" to "100 Вт",
                "Световой поток" to "9000 Лм",
                "Степень защиты" to "IP65 (пыле- и влагозащищенный)",
                "Корпус" to "Литой алюминий с радиатором охлаждения"
            ),
            description = "Мощное освещение фасадов, автостоянок, строительных площадок и складских зон."
        ),
        Product(
            id = "ECT-LGT-003",
            name = "Промышленный подвесной светильник колокол LED HighBay 150W IP65",
            category = ProductCategory.LIGHTING,
            brand = "Световые Технологии",
            article = "ST-HB-150-IP65",
            priceKzt = 24500,
            unit = "шт",
            specs = mapOf(
                "Мощность" to "150 Вт",
                "Световой поток" to "18 000 Лм",
                "Высота подвеса" to "от 5 до 12 метров",
                "Угол раскрытия луча" to "90°",
                "Степень защиты" to "IP65"
            ),
            description = "Профессиональный промышленный подвесной светильник для цехов, складов с высокими потолками, ангаров и логистических центров."
        ),

        // --- Розетки и выключатели ---
        Product(
            id = "ECT-WRG-001",
            name = "Розетка с заземлением Legrand Valena Classic (Белая)",
            category = ProductCategory.WIRING_ACCESSORIES,
            brand = "Legrand",
            article = "LEG-774420",
            priceKzt = 1850,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "16 А",
                "Заземление" to "Есть (евростандарт Schuko)",
                "Защитные шторки" to "Есть (защита от детей)",
                "Материал" to "Глянцевый термопласт, суппорт из стали"
            ),
            description = "Эталон надежности и долговечности от французского производителя Legrand."
        ),
        Product(
            id = "ECT-WRG-002",
            name = "Выключатель 2-клавишный Schneider Electric AtlasDesign (Белый)",
            category = ProductCategory.WIRING_ACCESSORIES,
            brand = "Schneider Electric",
            article = "ATN000121",
            priceKzt = 1650,
            unit = "шт",
            specs = mapOf(
                "Количество клавиш" to "2",
                "Номинальный ток" to "10 А",
                "Дизайн" to "Четкие геометрические линии, матовое покрытие с антибактериальными ионами серебра"
            ),
            description = "Стильный лаконичный двухклавишный выключатель для современных интерьеров."
        ),
        Product(
            id = "ECT-WRG-003",
            name = "Розетка силовая каучуковая 16А 250В IP44 (переносная)",
            category = ProductCategory.WIRING_ACCESSORIES,
            brand = "TDM Electric",
            article = "SQ0608-0002",
            priceKzt = 1450,
            unit = "шт",
            specs = mapOf(
                "Номинальный ток" to "16 А",
                "Материал корпуса" to "Ударопрочный каучук",
                "Степень защиты" to "IP44",
                "Назначение" to "Стройка, уличные удлинители, влажные условия"
            ),
            description = "Ударопрочная розетка не боится падений, влаги, масла и экстремальных температур от -40°C до +50°C."
        ),

        // --- Монтаж и кабель-каналы ---
        Product(
            id = "ECT-MNT-001",
            name = "Труба гофрированная ПВХ d20 мм с протяжкой (бухта 100м)",
            category = ProductCategory.CABLE_MANAGEMENT,
            brand = "Промрукав",
            article = "PR-GOFR-20-100",
            priceKzt = 7900,
            unit = "бухта",
            specs = mapOf(
                "Внешний диаметр" to "20 мм",
                "Внутренний диаметр" to "14.1 мм",
                "Протяжка" to "Стальная проволока в комплекте",
                "Материал" to "Самозатухающий ПВХ-пластикат",
                "Длина" to "100 метров"
            ),
            description = "Необходима для безопасной прокладки кабеля ВВГнг-LS 3х2.5 и 3х1.5 в штробах стен, за гипсокартоном и стяжках."
        ),
        Product(
            id = "ECT-MNT-002",
            name = "Кабель-канал 25х16 мм с двойным замком (2 метра)",
            category = ProductCategory.CABLE_MANAGEMENT,
            brand = "IEK",
            article = "CKK10-025-016-1-K01",
            priceKzt = 450,
            unit = "шт",
            specs = mapOf(
                "Сечение" to "25х16 мм",
                "Длина" to "2 метра",
                "Цвет" to "Белый",
                "Замок" to "Двойной плотный замок"
            ),
            description = "Для открытой аккуратной прокладки проводки в квартирах, офисах и загородных домах."
        ),
        Product(
            id = "ECT-MNT-003",
            name = "Наконечники штыревые изолированные НШВИ 2.5-8 (100 шт)",
            category = ProductCategory.CABLE_MANAGEMENT,
            brand = "КВТ",
            article = "KVT-NSHVI-25-8",
            priceKzt = 850,
            unit = "уп",
            specs = mapOf(
                "Сечение провода" to "2.5 мм²",
                "Длина гильзы" to "8 мм",
                "Материал" to "Луженая электротехническая медь",
                "Количество в упаковке" to "100 шт"
            ),
            description = "Обязательны для качественной опрессовки многожильного провода ПВС/ПуГВ перед зажимом в клеммах автоматов и розеток."
        ),

        // --- Инструмент и КИПиА ---
        Product(
            id = "ECT-TLS-001",
            name = "Мультиметр цифровой UNI-T UT33D+ с подсветкой и NCV",
            category = ProductCategory.TOOLS_INSTRUMENTS,
            brand = "UNI-T",
            article = "UT33D-PLUS",
            priceKzt = 6900,
            unit = "шт",
            specs = mapOf(
                "Измерение" to "Постоянное/переменное напряжение до 600В, ток до 10А, сопротивление",
                "Особенности" to "Бесконтактный детектор напряжения (NCV), прозвонка цепи со звуком",
                "Дисплей" to "С подсветкой, удержание данных (Data Hold)"
            ),
            description = "Надежный карманный мультиметр для электриков и домашних мастеров. Прорезиненный защитный чехол."
        ),
        Product(
            id = "ECT-TLS-002",
            name = "Пресс-клещи для опрессовки наконечников НШВИ 0.25-6.0 мм²",
            category = ProductCategory.TOOLS_INSTRUMENTS,
            brand = "КВТ",
            article = "CTK-01",
            priceKzt = 7200,
            unit = "шт",
            specs = mapOf(
                "Диапазон сечений" to "0.25 – 6.0 мм²",
                "Тип профиля" to "Трапециевидный обжим",
                "Механизм" to "Храповый механизм с автоматической разблокировкой"
            ),
            description = "Профессиональный обжимной кримпер для надежного электрического контакта без повреждения жил."
        ),
        Product(
            id = "ECT-TLS-003",
            name = "Отвертка-индикатор напряжения 100-500В со светодиодом",
            category = ProductCategory.TOOLS_INSTRUMENTS,
            brand = "IEK",
            article = "TI-100-500-LED",
            priceKzt = 450,
            unit = "шт",
            specs = mapOf(
                "Диапазон" to "100 – 500 В AC",
                "Индикатор" to "Яркий светодиод",
                "Длина" to "140 мм"
            ),
            description = "Базовый прибор проверки фазы в розетках и распределительных коробках перед началом любых работ."
        )
    )

    fun getById(id: String): Product? = products.find { it.id == id }

    fun getByCategory(category: ProductCategory): List<Product> =
        products.filter { it.category == category }

    fun search(query: String): List<Product> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return products
        return products.filter {
            it.name.lowercase().contains(q) ||
            it.brand.lowercase().contains(q) ||
            it.article.lowercase().contains(q) ||
            it.category.titleRu.lowercase().contains(q) ||
            it.description.lowercase().contains(q) ||
            it.specs.values.any { v -> v.lowercase().contains(q) }
        }
    }
}
