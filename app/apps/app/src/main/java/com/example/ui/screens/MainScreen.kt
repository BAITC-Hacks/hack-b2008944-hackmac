package com.example.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import com.example.ui.components.ProductDetailSheet
import com.example.ui.theme.EctBlue
import com.example.ui.theme.EctOrange
import com.example.ui.viewmodel.EctAppViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: EctAppViewModel,
    modifier: Modifier = Modifier
) {
    var currentTab by remember { mutableIntStateOf(0) }
    val cartItems by viewModel.cartItems.collectAsState()
    val selectedProduct by viewModel.selectedProductDetails.collectAsState()

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val coroutineScope = rememberCoroutineScope()

    val totalCartCount = remember(cartItems) {
        cartItems.sumOf { it.quantity }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar(
                modifier = Modifier.testTag("main_bottom_nav")
            ) {
                // Tab 0: ИИ-Консультант
                NavigationBarItem(
                    selected = currentTab == 0,
                    onClick = { currentTab = 0 },
                    icon = {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Chat,
                            contentDescription = "ИИ Консультант"
                        )
                    },
                    label = { Text("ИИ-Чат", fontWeight = if (currentTab == 0) FontWeight.Bold else FontWeight.Normal) },
                    modifier = Modifier.testTag("nav_chat")
                )

                // Tab 1: Каталог
                NavigationBarItem(
                    selected = currentTab == 1,
                    onClick = { currentTab = 1 },
                    icon = {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.List,
                            contentDescription = "Каталог"
                        )
                    },
                    label = { Text("Каталог", fontWeight = if (currentTab == 1) FontWeight.Bold else FontWeight.Normal) },
                    modifier = Modifier.testTag("nav_catalog")
                )

                // Tab 2: Расчеты / Калькулятор
                NavigationBarItem(
                    selected = currentTab == 2,
                    onClick = { currentTab = 2 },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Calculate,
                            contentDescription = "Калькулятор"
                        )
                    },
                    label = { Text("Расчеты", fontWeight = if (currentTab == 2) FontWeight.Bold else FontWeight.Normal) },
                    modifier = Modifier.testTag("nav_calculator")
                )

                // Tab 3: Корзина
                NavigationBarItem(
                    selected = currentTab == 3,
                    onClick = { currentTab = 3 },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (totalCartCount > 0) {
                                    Badge {
                                        Text("$totalCartCount")
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = "Корзина"
                            )
                        }
                    },
                    label = { Text("Корзина", fontWeight = if (currentTab == 3) FontWeight.Bold else FontWeight.Normal) },
                    modifier = Modifier.testTag("nav_cart")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentTab) {
                0 -> ChatScreen(
                    viewModel = viewModel,
                    onNavigateToCalculator = { currentTab = 2 }
                )
                1 -> CatalogScreen(
                    viewModel = viewModel,
                    onNavigateToChat = { currentTab = 0 }
                )
                2 -> CalculatorScreen(
                    viewModel = viewModel,
                    onNavigateToChat = { currentTab = 0 }
                )
                3 -> CartScreen(
                    viewModel = viewModel,
                    onNavigateToCatalog = { currentTab = 1 }
                )
            }

            // Product Detail Sheet
            selectedProduct?.let { product ->
                ProductDetailSheet(
                    product = product,
                    sheetState = sheetState,
                    onDismiss = { viewModel.closeProductDetails() },
                    onAddToCart = { qty ->
                        viewModel.addToCart(product, qty)
                        coroutineScope.launch { sheetState.hide() }.invokeOnCompletion {
                            viewModel.closeProductDetails()
                        }
                    },
                    onAskAi = {
                        coroutineScope.launch { sheetState.hide() }.invokeOnCompletion {
                            viewModel.askAiAboutProduct(product) {
                                currentTab = 0
                            }
                        }
                    }
                )
            }
        }
    }
}
