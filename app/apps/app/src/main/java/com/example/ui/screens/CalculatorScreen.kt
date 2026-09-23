package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.ToggleOn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.EctOrange
import com.example.ui.theme.EctSuccess
import com.example.ui.viewmodel.EctAppViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculatorScreen(
    viewModel: EctAppViewModel,
    onNavigateToChat: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Кабель", "Автомат / УЗО", "Освещение")

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Электротехнические расчеты",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = MaterialTheme.colorScheme.surface
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title, fontWeight = FontWeight.SemiBold) },
                        icon = {
                            when (index) {
                                0 -> Icon(Icons.Default.ElectricBolt, contentDescription = null, modifier = Modifier.size(20.dp))
                                1 -> Icon(Icons.Default.ToggleOn, contentDescription = null, modifier = Modifier.size(20.dp))
                                else -> Icon(Icons.Default.Lightbulb, contentDescription = null, modifier = Modifier.size(20.dp))
                            }
                        }
                    )
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                when (selectedTab) {
                    0 -> CableCalculatorTab(viewModel, onNavigateToChat)
                    1 -> BreakerCalculatorTab(viewModel, onNavigateToChat)
                    2 -> LightingCalculatorTab(viewModel, onNavigateToChat)
                }
            }
        }
    }
}

@Composable
fun CableCalculatorTab(
    viewModel: EctAppViewModel,
    onNavigateToChat: () -> Unit
) {
    val powerKw by viewModel.cablePowerKw.collectAsState()
    val voltage by viewModel.cableVoltage.collectAsState()
    val lengthM by viewModel.cableLengthM.collectAsState()
    val result by viewModel.cableResult.collectAsState()

    Text(
        text = "⚡ Расчет сечения кабеля по ПУЭ РК",
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold
    )
    Text(
        text = "Определяет минимальное сечение медной жилы и ток для безопасной работы без перегрева.",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )

    Spacer(modifier = Modifier.height(16.dp))

    // Power input
    OutlinedTextField(
        value = powerKw,
        onValueChange = { viewModel.updateCablePower(it) },
        label = { Text("Мощность нагрузки (кВт)") },
        placeholder = { Text("Например: 7.2 (для электроплиты)") },
        modifier = Modifier.fillMaxWidth().testTag("calc_power_input"),
        shape = RoundedCornerShape(12.dp)
    )

    Spacer(modifier = Modifier.height(12.dp))

    // Voltage selector
    Text(text = "Напряжение сети:", style = MaterialTheme.typography.labelMedium)
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        FilterChip(
            selected = voltage == 220,
            onClick = { viewModel.updateCableVoltage(220) },
            label = { Text("1 фаза • 220 В (квартира/дом)") }
        )
        FilterChip(
            selected = voltage == 380,
            onClick = { viewModel.updateCableVoltage(380) },
            label = { Text("3 фазы • 380 В (ввод/цех)") }
        )
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Length input
    OutlinedTextField(
        value = lengthM,
        onValueChange = { viewModel.updateCableLength(it) },
        label = { Text("Длина кабельной трассы (метров)") },
        modifier = Modifier.fillMaxWidth().testTag("calc_length_input"),
        shape = RoundedCornerShape(12.dp)
    )

    Spacer(modifier = Modifier.height(20.dp))

    // Result Card
    result?.let { res ->
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Результат расчета по ПУЭ:",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Сечение кабеля",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "${res.recommendedSectionMm2} мм²",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "Номинал автомата",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "${res.recommendedBreakerA} А (кривая C)",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.2f))
                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "• Расчетный ток: ${res.calculatedCurrentA} А\n• Падение напряжения: ${res.voltageDropPercent}% (допустимо по нормам РК до 4%)\n• Рекомендуемая марка: ${res.recommendedCableName}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = { viewModel.askAiByCableCalculation(onNavigateToChat) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Icon(Icons.AutoMirrored.Filled.Chat, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Подобрать кабель и автомат в ECT.kz")
                }
            }
        }
    }
}

@Composable
fun BreakerCalculatorTab(
    viewModel: EctAppViewModel,
    onNavigateToChat: () -> Unit
) {
    val selectedAppliance by viewModel.selectedAppliance.collectAsState()
    val result by viewModel.breakerResult.collectAsState()

    val appliances = listOf(
        "Варочная панель",
        "Кондиционер",
        "Стиральная машина",
        "Освещение",
        "Ввод в квартиру",
        "Розетки общие"
    )

    Text(
        text = "🛡️ Подбор автоматического выключателя и УЗО",
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold
    )
    Text(
        text = "Выберите тип электропотребителя для расчета характеристик защитного аппарата.",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )

    Spacer(modifier = Modifier.height(16.dp))

    // Appliance chips
    Text(text = "Тип электроприбора:", style = MaterialTheme.typography.labelMedium)
    Spacer(modifier = Modifier.height(6.dp))
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        appliances.chunked(2).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                row.forEach { app ->
                    FilterChip(
                        selected = selectedAppliance == app,
                        onClick = { viewModel.updateAppliance(app) },
                        label = { Text(app, fontSize = 13.sp) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }

    Spacer(modifier = Modifier.height(20.dp))

    result?.let { res ->
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Рекомендация инженера ECT.kz:",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "Номинальный ток", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(text = "${res.nominalCurrentA} Ампер", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "Характеристика", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(text = "Тип «${res.characteristicCurve}»", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                if (res.rcdCurrentMa != null) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = EctOrange.copy(alpha = 0.15f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Security, contentDescription = null, tint = EctOrange)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Требуется защита УЗО / дифавтомат с током утечки ${res.rcdCurrentMa} мА (защита от удара током)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                }

                Text(
                    text = res.explanation,
                    style = MaterialTheme.typography.bodyMedium,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = { viewModel.askAiByBreakerCalculation(onNavigateToChat) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.AutoMirrored.Filled.Chat, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Подобрать автоматы и УЗО в ECT.kz")
                }
            }
        }
    }
}

@Composable
fun LightingCalculatorTab(
    viewModel: EctAppViewModel,
    onNavigateToChat: () -> Unit
) {
    val roomType by viewModel.lightingRoomType.collectAsState()
    val areaM2 by viewModel.lightingAreaM2.collectAsState()
    val heightM by viewModel.lightingHeightM.collectAsState()
    val result by viewModel.lightingResult.collectAsState()

    val roomTypes = listOf("Склад", "Офис", "Магазин", "Улица")

    Text(
        text = "💡 Расчет освещения по нормам СП РК (СНиП)",
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold
    )
    Text(
        text = "Быстрый расчет требуемого светового потока и количества LED светильников.",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )

    Spacer(modifier = Modifier.height(16.dp))

    // Room Type Selector
    Text(text = "Назначение объекта:", style = MaterialTheme.typography.labelMedium)
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        roomTypes.forEach { type ->
            FilterChip(
                selected = roomType == type,
                onClick = { viewModel.updateLightingRoom(type) },
                label = { Text(type) }
            )
        }
    }

    Spacer(modifier = Modifier.height(12.dp))

    // Area
    OutlinedTextField(
        value = areaM2,
        onValueChange = { viewModel.updateLightingArea(it) },
        label = { Text("Площадь помещения (м²)") },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    )

    Spacer(modifier = Modifier.height(12.dp))

    // Height
    OutlinedTextField(
        value = heightM,
        onValueChange = { viewModel.updateLightingHeight(it) },
        label = { Text("Высота потолков (метров)") },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    )

    Spacer(modifier = Modifier.height(20.dp))

    result?.let { res ->
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Светотехнический расчет:",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(text = "Количество светильников", fontSize = 12.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
                        Text(text = "${res.fixtureCount} шт.", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "Норма освещенности", fontSize = 12.sp, color = MaterialTheme.colorScheme.onPrimaryContainer)
                        Text(text = "${res.luxStandard} Люкс", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.2f))
                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "• Тип светильника: ${res.recommendedFixtureType}\n• Суммарный световой поток: %,d Лм".format(res.totalLumensRequired).replace(',', ' '),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = { viewModel.askAiByLightingCalculation(onNavigateToChat) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Icon(Icons.AutoMirrored.Filled.Chat, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Подобрать светильники в ECT.kz")
                }
            }
        }
    }
}
