package com.example.data.model

enum class ProductCategory(
    val titleRu: String,
    val iconName: String,
    val description: String
) {
    CABLE(
        titleRu = "Кабель и провод",
        iconName = "cable",
        description = "Силовые кабели ВВГнг-LS, СИП, КГ, ПВС, витая пара UTP"
    ),
    MODULAR_AUTOMATION(
        titleRu = "Модульная автоматика",
        iconName = "toggle_on",
        description = "Автоматические выключатели, УЗО, дифавтоматы, контакторы"
    ),
    PANELS_BOXES(
        titleRu = "Щиты и боксы",
        iconName = "dashboard",
        description = "ЩРН, ЩМП, пластиковые боксы, DIN-рейки, шины"
    ),
    LIGHTING(
        titleRu = "Светотехника",
        iconName = "lightbulb",
        description = "LED панели, промышленные колокола, прожекторы, светильники"
    ),
    WIRING_ACCESSORIES(
        titleRu = "Розетки и выключатели",
        iconName = "power",
        description = "Legrand, Schneider Electric, Makel, силовые разъемы"
    ),
    CABLE_MANAGEMENT(
        titleRu = "Монтаж и кабель-каналы",
        iconName = "build",
        description = "Гофротрубы ПВХ/ПНД, кабель-каналы, наконечники НШВИ, стяжки"
    ),
    TOOLS_INSTRUMENTS(
        titleRu = "Инструмент и КИПиА",
        iconName = "handyman",
        description = "Мультиметры, токоизмерительные клещи, кримперы, отвертки"
    )
}

data class Product(
    val id: String,
    val name: String,
    val category: ProductCategory,
    val brand: String,
    val article: String,
    val priceKzt: Int,
    val unit: String = "шт",
    val specs: Map<String, String>,
    val description: String,
    val inStockAlmaty: Boolean = true,
    val inStockAstana: Boolean = true,
    val rating: Float = 4.9f,
    val reviewsCount: Int = 18,
    val popularBadge: String? = null
) {
    val formattedPrice: String
        get() = "%,d ₸".format(priceKzt).replace(',', ' ')
}
