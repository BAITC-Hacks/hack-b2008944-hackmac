package com.example.data.remote

import android.util.Log
import com.example.BuildConfig
import com.example.data.calculator.ElectricalCalculators
import com.example.data.model.EctCatalogData
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

class GeminiApiClient {

    private val moshi: Moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val requestAdapter = moshi.adapter(GeminiRequest::class.java)
    private val responseAdapter = moshi.adapter(GeminiResponse::class.java)

    data class ConsultantResult(
        val replyText: String,
        val recommendedProductIds: List<String>
    )

    private val systemInstructionText = """
        Ты — ведущий инженер-электротехник и умный ИИ-консультант интернет-магазина электротоваров ECT.kz (ТОО «Электрокомплект», Казахстан, сайт ekt.kz).
        Твоя задача — профессионально консультировать клиентов, подбирать электротовары, рассчитывать сечения кабеля по ПУЭ РК, номиналы автоматов, УЗО, реле напряжения, щитовое оборудование и светотехнику, чтобы клиент мог заказать всё нужное без звонка менеджеру.
        
        Правила ответа:
        1. Отвечай вежливо, четко и технически грамотно на русском языке (с возможностью понимания казахских терминов).
        2. Приводи расчеты (мощность P, напряжение 220В/380В, расчетный ток I=P/U, сечение мм², запас прочности).
        3. Напоминай о правилах электробезопасности: УЗО 10мА/30мА для ванных и мокрых зон, реле напряжения 63А для защиты от скачков в сети РК.
        4. Указывай конкретные товары из каталога ECT.kz с ориентировочными ценами в тенге (₸).
        5. В самом конце ответа ОБЯЗАТЕЛЬНО добавь строку в формате:
           [PRODUCTS: ID1, ID2, ID3]
           где ID - идентификаторы из доступного каталога:
           - Кабели: ECT-CBL-001 (ВВГнг-LS 3х2.5), ECT-CBL-002 (ВВГнг-LS 3х1.5), ECT-CBL-003 (ВВГнг-LS 3х6), ECT-CBL-004 (СИП-4 4х16), ECT-CBL-005 (ПВС 3х2.5)
           - Автоматика: ECT-AUT-001 (CHINT 1P 16A), ECT-AUT-002 (CHINT 1P 10A), ECT-AUT-003 (IEK 1P 32A), ECT-AUT-004 (УЗО IEK 2P 40A 30mA), ECT-AUT-005 (Дифавтомат DEKraft 16A), ECT-AUT-006 (Реле напряжения 63A вольтметр), ECT-AUT-007 (Schneider 3P 25A)
           - Щиты: ECT-PNL-001 (Бокс ЩРН-П 24 мод), ECT-PNL-002 (ЩРн 36 мод металл), ECT-PNL-003 (Счетчик Энергомера)
           - Свет: ECT-LGT-001 (Панель LED 36W Армстронг), ECT-LGT-002 (Прожектор LED 100W IP65), ECT-LGT-003 (Колокол HighBay 150W IP65)
           - Розетки: ECT-WRG-001 (Legrand Valena розетка), ECT-WRG-002 (Schneider выключатель), ECT-WRG-003 (Каучуковая розетка)
           - Монтаж и приборы: ECT-MNT-001 (Гофра d20), ECT-MNT-002 (Кабель-канал 25х16), ECT-MNT-003 (НШВИ 2.5), ECT-TLS-001 (Мультиметр UNI-T), ECT-TLS-002 (Кримпер КВТ), ECT-TLS-003 (Индикатор)
    """.trimIndent()

    suspend fun getConsultantReply(
        history: List<Pair<Boolean, String>>, // (isUser, text)
        userPrompt: String
    ): ConsultantResult = withContext(Dispatchers.IO) {
        val apiKey = try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Throwable) {
            ""
        }

        if (apiKey.isNotBlank() && apiKey != "MY_GEMINI_API_KEY") {
            try {
                val contentsList = mutableListOf<GeminiContent>()
                // Add last few history messages (up to 4)
                val recentHistory = history.takeLast(4)
                for ((isUser, text) in recentHistory) {
                    contentsList.add(
                        GeminiContent(
                            role = if (isUser) "user" else "model",
                            parts = listOf(GeminiPart(text = text))
                        )
                    )
                }
                contentsList.add(
                    GeminiContent(
                        role = "user",
                        parts = listOf(GeminiPart(text = userPrompt))
                    )
                )

                val requestObj = GeminiRequest(
                    contents = contentsList,
                    systemInstruction = GeminiContent(
                        parts = listOf(GeminiPart(text = systemInstructionText))
                    ),
                    generationConfig = GeminiGenerationConfig()
                )

                val jsonBody = requestAdapter.toJson(requestObj)
                val mediaType = "application/json; charset=utf-8".toMediaType()
                val requestBody = jsonBody.toRequestBody(mediaType)

                val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=$apiKey"
                val httpRequest = Request.Builder()
                    .url(url)
                    .post(requestBody)
                    .build()

                val httpResponse = okHttpClient.newCall(httpRequest).execute()
                val responseBodyStr = httpResponse.body?.string()

                if (httpResponse.isSuccessful && !responseBodyStr.isNullOrBlank()) {
                    val parsed = responseAdapter.fromJson(responseBodyStr)
                    val rawText = parsed?.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                    if (!rawText.isNullOrBlank()) {
                        return@withContext parseResponse(rawText)
                    }
                } else {
                    Log.w("GeminiApiClient", "Gemini API failed code=${httpResponse.code}, falling back to local engineer")
                }
            } catch (e: Exception) {
                Log.e("GeminiApiClient", "Gemini API error: ${e.message}, falling back to expert rule engine", e)
            }
        }

        // High quality offline electrical engineering rule engine
        return@withContext generateExpertLocalConsultation(userPrompt)
    }

    private fun parseResponse(rawText: String): ConsultantResult {
        val productIds = mutableListOf<String>()
        val regex = Pattern.compile("\\[PRODUCTS:\\s*([^\\]]+)\\]")
        val matcher = regex.matcher(rawText)
        var cleanText = rawText

        if (matcher.find()) {
            val idsGroup = matcher.group(1) ?: ""
            val foundIds = idsGroup.split(",").map { it.trim() }.filter { it.startsWith("ECT-") }
            productIds.addAll(foundIds)
            cleanText = rawText.replace(matcher.group(0) ?: "", "").trim()
        } else {
            // Also extract any ECT-* patterns mentioned directly in text
            val idPattern = Pattern.compile("ECT-[A-Z]{3}-\\d{3}")
            val idMatcher = idPattern.matcher(rawText)
            while (idMatcher.find()) {
                val id = idMatcher.group()
                if (!productIds.contains(id)) {
                    productIds.add(id)
                }
            }
        }

        // If no products detected, find relevant keywords
        if (productIds.isEmpty()) {
            productIds.addAll(findProductsByKeywords(cleanText))
        }

        return ConsultantResult(
            replyText = cleanText,
            recommendedProductIds = productIds.distinct()
        )
    }

    /**
     * Fallback expert electrical engineering assistant
     */
    private fun generateExpertLocalConsultation(userPrompt: String): ConsultantResult {
        val prompt = userPrompt.lowercase()

        val reply = buildString {
            append("Здравствуйте! Я ИИ-консультант интернет-магазина ECT.kz.\n\n")

            when {
                // Варочная панель / плита
                prompt.contains("плит") || prompt.contains("варочн") || prompt.contains("индукц") || prompt.contains("духов") -> {
                    val calc = ElectricalCalculators.calculateCable(powerKw = 7.2, voltageV = 220)
                    append("⚡ **Подбор кабеля и защиты для варочной панели / плиты (7.2 кВт, 220В):**\n\n")
                    append("• **Расчет:** Ток при максимальной нагрузке составляет **${calc.calculatedCurrentA} А**.\n")
                    append("• **Кабель:** Строго медный трехжильный **ВВГнг(А)-LS 3х6 мм²** (ГОСТ). Сечения 3х4 может не хватить при одновременной работе всех конфорок и бустера!\n")
                    append("• **Автоматический выключатель:** Номинал **32 А** с характеристикой расцепления **C** (CHINT или IEK).\n")
                    append("• **Безопасность:** Для защиты от поражения током рекомендуем УЗО 40А 30мА.\n\n")
                    append("Все комплектующие в наличии на складах ECT.kz в Алматы и Астане.")
                    return ConsultantResult(
                        replyText = this.toString(),
                        recommendedProductIds = listOf("ECT-CBL-003", "ECT-AUT-003", "ECT-AUT-004", "ECT-MNT-001")
                    )
                }

                // Сборка щитка / щит
                prompt.contains("щит") || prompt.contains("бокс") || prompt.contains("квартир") -> {
                    append("🛡️ **Рекомендованная спецификация электрощита для квартиры от инженеров ECT.kz:**\n\n")
                    append("1. **Корпус:** Бокс пластиковый навесной или встраиваемый **ЩРН-П на 24 модуля** (IEK) с шинами N/PE и DIN-рейками.\n")
                    append("2. **Вводная группа:**\n")
                    append("   • Вводной автомат 2P 32А/40А (C)\n")
                    append("   • **Реле контроля напряжения 63А** с вольтметром (защитит телевизоры, стиралку и холодильник от скачков 220В/380В и обрыва нуля)\n")
                    append("3. **Мокрые зоны (ванная, стиральная, посудомоечная машина):**\n")
                    append("   • Дифференциальный автомат DEKraft 16A 30мА или УЗО 40А 30мА\n")
                    append("4. **Розеточные группы:** Автоматы CHINT 1P 16A (C) + кабель ВВГнг-LS 3х2.5\n")
                    append("5. **Освещение:** Автоматы CHINT 1P 10A (C) + кабель ВВГнг-LS 3х1.5\n\n")
                    append("Ниже подобран готовый комплект из каталога ECT.kz:")
                    return ConsultantResult(
                        replyText = this.toString(),
                        recommendedProductIds = listOf("ECT-PNL-001", "ECT-AUT-006", "ECT-AUT-005", "ECT-AUT-001", "ECT-AUT-002", "ECT-CBL-001")
                    )
                }

                // Кондиционер
                prompt.contains("кондиционер") || prompt.contains("сплит") -> {
                    append("❄️ **Подключение кондиционера (до 3.5 кВт):**\n\n")
                    append("• **Кабель:** Рекомендуем отдельную линию медным кабелем **ВВГнг(А)-LS 3х2.5 мм²**.\n")
                    append("• **Автомат:** Однополюсный **CHINT 16A** с характеристикой **C**. Кривая C выдерживает пусковой ток компрессора и предотвращает ложные отключения.\n")
                    append("• **Розетка:** Влагостойкая или стандартная розетка с заземлением Legrand 16A.\n")
                    return ConsultantResult(
                        replyText = this.toString(),
                        recommendedProductIds = listOf("ECT-AUT-001", "ECT-CBL-001", "ECT-WRG-001", "ECT-MNT-002")
                    )
                }

                // Освещение / склад / офис / светильники
                prompt.contains("свет") || prompt.contains("освещен") || prompt.contains("склад") || prompt.contains("офис") || prompt.contains("прожектор") || prompt.contains("армстронг") -> {
                    append("💡 **Светотехнический расчет и подбор светильников ECT.kz:**\n\n")
                    if (prompt.contains("склад") || prompt.contains("цех") || prompt.contains("ангар")) {
                        val calc = ElectricalCalculators.calculateLighting("склад", 150.0, 6.0)
                        append("Для склада или цеха с высокими потолками (норма ${calc.luxStandard} лк):\n")
                        append("• Оптимальный выбор — **подвесные промышленные колокола LED HighBay 150W IP65** (18 000 Лм).\n")
                        append("• Они обеспечивают равномерную заливку без ослепления и защиту от пыли и влаги.\n")
                        return ConsultantResult(
                            replyText = this.toString(),
                            recommendedProductIds = listOf("ECT-LGT-003", "ECT-LGT-002", "ECT-CBL-002", "ECT-AUT-002")
                        )
                    } else {
                        append("Для офисных, торговых и учебных помещений:\n")
                        append("• Рекомендуем светодиодные панели **LED 36W 595х595 (в потолок Армстронг)** со световым потоком 3200 Лм и температурой 4000K (нейтральный свет).\n")
                        append("• Коэффициент пульсации <1% — глаза сотрудников не устают в течение рабочего дня.\n")
                        return ConsultantResult(
                            replyText = this.toString(),
                            recommendedProductIds = listOf("ECT-LGT-001", "ECT-CBL-002", "ECT-AUT-002", "ECT-WRG-002")
                        )
                    }
                }

                // Кабель / сечение
                prompt.contains("кабель") || prompt.contains("провод") || prompt.contains("сечен") || prompt.contains("ввг") || prompt.contains("сип") -> {
                    append("🔌 **Подбор кабельно-проводниковой продукции в ECT.kz:**\n\n")
                    append("Вся кабельная продукция в ECT.kz сертифицирована по ГОСТ 31996-2012 от завода «Казэнергокабель» с честным сечением жил:\n\n")
                    append("• **ВВГнг(А)-LS 3х1.5** — группы освещения (автомат 10А)\n")
                    append("• **ВВГнг(А)-LS 3х2.5** — стандартные розеточные группы (автомат 16А)\n")
                    append("• **ВВГнг(А)-LS 3х6.0** — электроплиты, мощные водонагреватели (автомат 32А)\n")
                    append("• **СИП-4 4х16** — ввод воздушной линии 380В от столба в частный дом\n")
                    append("• **ПВС 3х2.5** — гибкий провод для удлинителей и подвижного оборудования\n\n")
                    append("Также не забудьте гофротрубу d20 мм для безопасной прокладки.")
                    return ConsultantResult(
                        replyText = this.toString(),
                        recommendedProductIds = listOf("ECT-CBL-001", "ECT-CBL-002", "ECT-CBL-003", "ECT-MNT-001")
                    )
                }

                // Автоматы / УЗО / Schneider / Chint
                prompt.contains("автомат") || prompt.contains("узо") || prompt.contains("диф") || prompt.contains("chint") || prompt.contains("schneider") -> {
                    append("⚡ **Модульное защитное оборудование в ECT.kz:**\n\n")
                    append("• **CHINT (серия eB)** — лидер по соотношению цена/надежность в Казахстане. Отключающая способность 4.5 кА, медные контакты с серебряным напылением.\n")
                    append("• **DEKraft** — качественные дифференциальные автоматы 2в1 (защита от КЗ и утечки тока 30мА).\n")
                    append("• **Schneider Electric Acti9** — промышленный флагман с отключающей способностью 6 кА для ответственных объектов.\n")
                    append("• **Реле напряжения 63А TDM** — цифровой контроль 140-300В для защиты всей дорогой техники.\n")
                    return ConsultantResult(
                        replyText = this.toString(),
                        recommendedProductIds = listOf("ECT-AUT-001", "ECT-AUT-004", "ECT-AUT-005", "ECT-AUT-006", "ECT-AUT-007")
                    )
                }

                // Инструмент / тестер
                prompt.contains("инструмент") || prompt.contains("мультиметр") || prompt.contains("обжим") || prompt.contains("тестер") -> {
                    append("🔧 **Профессиональный инструмент электромонтажника в ECT.kz:**\n\n")
                    append("• **Мультиметр UNI-T UT33D+** с бесконтактным определением фазы (NCV) и звуковой прозвонкой цепей.\n")
                    append("• **Пресс-клещи КВТ** для опрессовки наконечников НШВИ 0.25-6.0 мм² — гарантируют монолитный контакт без искрения.\n")
                    append("• **Отвертка-индикатор** для безопасной проверки наличия напряжения перед работой.\n")
                    return ConsultantResult(
                        replyText = this.toString(),
                        recommendedProductIds = listOf("ECT-TLS-001", "ECT-TLS-002", "ECT-TLS-003", "ECT-MNT-003")
                    )
                }

                else -> {
                    append("Я готов помочь вам с подбором любого электрооборудования из каталога ECT.kz:\n\n")
                    append("• **Расчет сечения кабеля** под вашу мощность или технику (кВт/А)\n")
                    append("• **Подбор автоматов, УЗО и дифавтоматов** по ПУЭ РК\n")
                    append("• **Комплектация щита** для квартиры, дома или объекта\n")
                    append("• **Расчет освещенности** складов, офисов и уличных зон\n")
                    append("• **Подбор аналогов** снятых с производства или дорогих европейских брендов\n\n")
                    append("Напишите параметры задачи (например: *«какой кабель нужен для бойлера 2.5 кВт на расстоянии 20 метров?»*) или воспользуйтесь быстрыми кнопками ниже!")
                    return ConsultantResult(
                        replyText = this.toString(),
                        recommendedProductIds = listOf("ECT-CBL-001", "ECT-AUT-001", "ECT-AUT-006", "ECT-PNL-001")
                    )
                }
            }
        }
    }

    private fun findProductsByKeywords(text: String): List<String> {
        val t = text.lowercase()
        val found = mutableListOf<String>()
        for (prod in EctCatalogData.products) {
            if (t.contains(prod.name.lowercase()) ||
                t.contains(prod.brand.lowercase()) ||
                t.contains(prod.article.lowercase())
            ) {
                found.add(prod.id)
            }
        }
        return found
    }
}
