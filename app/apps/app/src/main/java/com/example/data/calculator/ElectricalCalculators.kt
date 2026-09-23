package com.example.data.calculator

import kotlin.math.roundToInt
import kotlin.math.sqrt

data class CableCalculationResult(
    val recommendedSectionMm2: Double,
    val calculatedCurrentA: Double,
    val voltageDropPercent: Double,
    val recommendedBreakerA: Int,
    val recommendedCableName: String,
    val matchingProductIds: List<String>,
    val explanation: String
)

data class BreakerCalculationResult(
    val nominalCurrentA: Int,
    val characteristicCurve: String,
    val poles: Int,
    val rcdCurrentMa: Int?,
    val recommendedCableSectionMm2: Double,
    val matchingProductIds: List<String>,
    val explanation: String
)

data class LightingCalculationResult(
    val luxStandard: Int,
    val totalLumensRequired: Int,
    val fixtureCount: Int,
    val recommendedFixtureType: String,
    val matchingProductIds: List<String>,
    val explanation: String
)

object ElectricalCalculators {

    /**
     * Расчет сечения кабеля по ПУЭ (Правилам устройства электроустановок)
     */
    fun calculateCable(
        powerKw: Double,
        voltageV: Int = 220,
        lengthMeters: Double = 15.0,
        isCopper: Boolean = true,
        cosPhi: Double = 0.95
    ): CableCalculationResult {
        // Расчет тока I = P / (U * cosPhi) для 1 фазы, I = P / (sqrt(3) * U * cosPhi) для 3 фаз
        val currentA = if (voltageV == 380) {
            (powerKw * 1000.0) / (sqrt(3.0) * voltageV * cosPhi)
        } else {
            (powerKw * 1000.0) / (voltageV * cosPhi)
        }

        // Стандартные сечения и длительно допустимые токи для медного кабеля ВВГнг-LS в воздухе/трубе (ПУЭ табл. 1.3.4)
        val copperSections = listOf(1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0)
        val copperCurrentLimits = mapOf(
            1.5 to 19.0,
            2.5 to 27.0,
            4.0 to 38.0,
            6.0 to 46.0,
            10.0 to 70.0,
            16.0 to 85.0,
            25.0 to 115.0,
            35.0 to 135.0,
            50.0 to 175.0
        )

        // Минимальное сечение по току нагрева
        var selectedSection = copperSections.firstOrNull { (copperCurrentLimits[it] ?: 0.0) >= currentA } ?: 50.0

        // Проверка падения напряжения: delta U (%) = (2 * L * I * 100) / (gamma * S * U)
        // gamma для меди = 57 м/(Ом*мм²), для алюминия = 34
        val gamma = if (isCopper) 57.0 else 34.0
        var dropPercent: Double
        do {
            val coef = if (voltageV == 380) sqrt(3.0) else 2.0
            dropPercent = (coef * lengthMeters * currentA * 100.0) / (gamma * selectedSection * voltageV)
            if (dropPercent > 4.0) {
                val nextIndex = copperSections.indexOf(selectedSection) + 1
                if (nextIndex < copperSections.size) {
                    selectedSection = copperSections[nextIndex]
                } else {
                    break
                }
            }
        } while (dropPercent > 4.0 && selectedSection < 50.0)

        // Подбор номинала автомата по защите кабеля:
        val breakerA = when {
            selectedSection <= 1.5 -> 10
            selectedSection <= 2.5 -> 16
            selectedSection <= 4.0 -> 25
            selectedSection <= 6.0 -> 32
            selectedSection <= 10.0 -> 50
            else -> 63
        }

        val cableName = if (voltageV == 380) {
            "ВВГнг(А)-LS 5х$selectedSection ГОСТ"
        } else {
            "ВВГнг(А)-LS 3х$selectedSection ГОСТ"
        }

        val matchingIds = mutableListOf<String>()
        if (selectedSection <= 1.5) {
            matchingIds.add("ECT-CBL-002") // 3x1.5
            matchingIds.add("ECT-AUT-002") // 10A CHINT
        } else if (selectedSection <= 2.5) {
            matchingIds.add("ECT-CBL-001") // 3x2.5
            matchingIds.add("ECT-AUT-001") // 16A CHINT
            matchingIds.add("ECT-MNT-001") // Гофра 20мм
        } else if (selectedSection <= 6.0) {
            matchingIds.add("ECT-CBL-003") // 3x6
            matchingIds.add("ECT-AUT-003") // 32A IEK
        } else {
            matchingIds.add("ECT-CBL-004") // СИП 4х16
            matchingIds.add("ECT-AUT-007") // 3P 25A
        }

        val explanation = buildString {
            append("Расчетный ток: %.1f А при мощности %.1f кВт (%dВ).\n".format(currentA, powerKw, voltageV))
            append("Рекомендовано медное сечение: %.1f мм² (по ПУЭ РК).\n".format(selectedSection))
            append("Падение напряжения на дистанции %.0f м: %.2f%% (допустимо до 4%%).\n".format(lengthMeters, dropPercent))
            append("Защитный автомат: %dА с кривой C (защищает кабель от перегрева).".format(breakerA))
        }

        return CableCalculationResult(
            recommendedSectionMm2 = selectedSection,
            calculatedCurrentA = (currentA * 10).roundToInt() / 10.0,
            voltageDropPercent = (dropPercent * 100).roundToInt() / 100.0,
            recommendedBreakerA = breakerA,
            recommendedCableName = cableName,
            matchingProductIds = matchingIds,
            explanation = explanation
        )
    }

    /**
     * Подбор автомата и УЗО по типу электроприбора
     */
    fun calculateBreakerForAppliance(applianceType: String): BreakerCalculationResult {
        return when (applianceType.lowercase()) {
            "плита", "варочная панель", "духовой шкаф", "электроплита" -> BreakerCalculationResult(
                nominalCurrentA = 32,
                characteristicCurve = "C",
                poles = 1,
                rcdCurrentMa = 30,
                recommendedCableSectionMm2 = 6.0,
                matchingProductIds = listOf("ECT-AUT-003", "ECT-CBL-003", "ECT-AUT-004"),
                explanation = "Для варочной панели 7-8 кВт необходим автомат 32А, медный кабель ВВГнг-LS 3х6 мм² и УЗО 40А 30мА."
            )
            "кондиционер", "сплит-система" -> BreakerCalculationResult(
                nominalCurrentA = 16,
                characteristicCurve = "C",
                poles = 1,
                rcdCurrentMa = 30,
                recommendedCableSectionMm2 = 2.5,
                matchingProductIds = listOf("ECT-AUT-001", "ECT-CBL-001"),
                explanation = "Для кондиционера (до 3.5 кВт холода) устанавливается автомат 16А кривой C (устойчив к пусковым токам компрессора) и кабель 3х2.5."
            )
            "стиральная машина", "бойлер", "водонагреватель", "посудомойка" -> BreakerCalculationResult(
                nominalCurrentA = 16,
                characteristicCurve = "C",
                poles = 1,
                rcdCurrentMa = 10,
                recommendedCableSectionMm2 = 2.5,
                matchingProductIds = listOf("ECT-AUT-005", "ECT-CBL-001", "ECT-AUT-004"),
                explanation = "«Мокрая зона» обязательно требует защиты УЗО или дифавтоматом с током утечки 10мА или 30мА для исключения удара током."
            )
            "освещение", "свет", "люстры" -> BreakerCalculationResult(
                nominalCurrentA = 10,
                characteristicCurve = "B/C",
                poles = 1,
                rcdCurrentMa = null,
                recommendedCableSectionMm2 = 1.5,
                matchingProductIds = listOf("ECT-AUT-002", "ECT-CBL-002"),
                explanation = "Для светодиодного освещения используется автомат 10А (или 6А) и кабель ВВГнг-LS 3х1.5 мм²."
            )
            "ввод в квартиру", "вводной", "общий" -> BreakerCalculationResult(
                nominalCurrentA = 40,
                characteristicCurve = "C",
                poles = 2,
                rcdCurrentMa = 30,
                recommendedCableSectionMm2 = 10.0,
                matchingProductIds = listOf("ECT-AUT-006", "ECT-PNL-001", "ECT-PNL-003"),
                explanation = "Вводной автомат 40А (2P), реле контроля напряжения 63А для защиты от перепадов в сети 220В и противопожарное УЗО."
            )
            else -> BreakerCalculationResult(
                nominalCurrentA = 16,
                characteristicCurve = "C",
                poles = 1,
                rcdCurrentMa = 30,
                recommendedCableSectionMm2 = 2.5,
                matchingProductIds = listOf("ECT-AUT-001", "ECT-CBL-001", "ECT-WRG-001"),
                explanation = "Стандартная розеточная группа: автомат 16А (C), кабель ВВГнг-LS 3х2.5 мм², розетки 16А с заземлением."
            )
        }
    }

    /**
     * Расчет освещенности по нормам СП РК (СНиП)
     */
    fun calculateLighting(
        roomType: String,
        areaM2: Double,
        ceilingHeightM: Double = 3.0
    ): LightingCalculationResult {
        val (luxStandard, fixtureType, watts, lumensPerFixture, productIds) = when (roomType.lowercase()) {
            "склад", "цех", "ангар", "производство" -> {
                val h = if (ceilingHeightM > 5.0) 150 else 200
                val ids = if (ceilingHeightM > 5.0) listOf("ECT-LGT-003") else listOf("ECT-LGT-002")
                val p = if (ceilingHeightM > 5.0) "HighBay 150W" else "Прожектор LED 100W"
                val lm = if (ceilingHeightM > 5.0) 18000 else 9000
                val w = if (ceilingHeightM > 5.0) 150 else 100
                listOf(h, p, w, lm, ids)
            }
            "офис", "кабинет", "школа", "больница" -> {
                listOf(400, "LED панель Армстронг 36W 595х595", 36, 3200, listOf("ECT-LGT-001"))
            }
            "магазин", "торговый зал", "шоурум" -> {
                listOf(500, "LED панель 36W 4000K", 36, 3200, listOf("ECT-LGT-001", "ECT-LGT-002"))
            }
            "улица", "парковка", "двор" -> {
                listOf(50, "Прожектор уличный LED SMD 100W IP65", 100, 9000, listOf("ECT-LGT-002"))
            }
            else -> {
                listOf(200, "LED светильник 36W", 36, 3200, listOf("ECT-LGT-001"))
            }
        }

        val lux = luxStandard as Int
        val fixtureName = fixtureType as String
        val singleWatts = watts as Int
        val singleLm = lumensPerFixture as Int
        @Suppress("UNCHECKED_CAST")
        val ids = productIds as List<String>

        // Формула коэффициента использования: E = (N * F * n) / (S * k)
        // F_total = (E * S * k_запаса) / eta_использования
        val kSafety = 1.3 // коэффициент запаса (запыленность, старение LED)
        val utilization = if (ceilingHeightM > 6.0) 0.55 else 0.65
        val totalLumens = (lux * areaM2 * kSafety / utilization).toInt()
        val count = kotlin.math.max(1, kotlin.math.ceil(totalLumens.toDouble() / singleLm).toInt())

        val explanation = buildString {
            append("Норма освещенности: %d лк (по СП РК).\n".format(lux))
            append("Площадь: %.0f м² (высота %.1f м).\n".format(areaM2, ceilingHeightM))
            append("Общий требуемый световой поток: %,d Лм.\n".format(totalLumens).replace(',', ' '))
            append("Рекомендовано светильников: %d шт. (%s, %d Вт).".format(count, fixtureName, singleWatts))
        }

        return LightingCalculationResult(
            luxStandard = lux,
            totalLumensRequired = totalLumens,
            fixtureCount = count,
            recommendedFixtureType = fixtureName,
            matchingProductIds = ids,
            explanation = explanation
        )
    }
}
