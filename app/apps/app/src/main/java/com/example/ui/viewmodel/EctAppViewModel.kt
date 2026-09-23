package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.calculator.BreakerCalculationResult
import com.example.data.calculator.CableCalculationResult
import com.example.data.calculator.ElectricalCalculators
import com.example.data.calculator.LightingCalculationResult
import com.example.data.local.AppDatabase
import com.example.data.local.ChatMessageEntity
import com.example.data.model.EctCatalogData
import com.example.data.model.Product
import com.example.data.model.ProductCategory
import com.example.data.repository.CartItemWithProduct
import com.example.data.repository.EctRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class CatalogFilterState(
    val searchQuery: String = "",
    val selectedCategory: ProductCategory? = null,
    val selectedBrand: String? = null,
    val sortBy: CatalogSort = CatalogSort.POPULAR
)

enum class CatalogSort(val label: String) {
    POPULAR("По популярности"),
    PRICE_ASC("Сначала дешевле"),
    PRICE_DESC("Сначала дороже"),
    RATING("По рейтингу")
}

class EctAppViewModel(application: Application) : AndroidViewModel(application) {

    private val database = AppDatabase.getInstance(application)
    private val repository = EctRepository(database)

    // --- Chat State ---
    val chatMessages: StateFlow<List<ChatMessageEntity>> = repository.allChatMessages
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isAiTyping = MutableStateFlow(false)
    val isAiTyping: StateFlow<Boolean> = _isAiTyping.asStateFlow()

    private val _chatInput = MutableStateFlow("")
    val chatInput: StateFlow<String> = _chatInput.asStateFlow()

    // --- Catalog State ---
    private val _filterState = MutableStateFlow(CatalogFilterState())
    val filterState: StateFlow<CatalogFilterState> = _filterState.asStateFlow()

    val filteredProducts: StateFlow<List<Product>> = _filterState.combine(
        MutableStateFlow(EctCatalogData.products)
    ) { filter, all ->
        var list = all
        if (filter.selectedCategory != null) {
            list = list.filter { it.category == filter.selectedCategory }
        }
        if (filter.selectedBrand != null) {
            list = list.filter { it.brand.equals(filter.selectedBrand, ignoreCase = true) }
        }
        if (filter.searchQuery.isNotBlank()) {
            val q = filter.searchQuery.trim().lowercase()
            list = list.filter {
                it.name.lowercase().contains(q) ||
                it.brand.lowercase().contains(q) ||
                it.article.lowercase().contains(q) ||
                it.description.lowercase().contains(q)
            }
        }
        when (filter.sortBy) {
            CatalogSort.POPULAR -> list.sortedByDescending { it.reviewsCount }
            CatalogSort.PRICE_ASC -> list.sortedBy { it.priceKzt }
            CatalogSort.PRICE_DESC -> list.sortedByDescending { it.priceKzt }
            CatalogSort.RATING -> list.sortedByDescending { it.rating }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), EctCatalogData.products)

    private val _selectedProductDetails = MutableStateFlow<Product?>(null)
    val selectedProductDetails: StateFlow<Product?> = _selectedProductDetails.asStateFlow()

    // --- Cart & Favorites ---
    val cartItems: StateFlow<List<CartItemWithProduct>> = repository.cartWithProducts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favorites: StateFlow<List<Product>> = repository.favorites
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- Calculators State ---
    // Cable
    private val _cablePowerKw = MutableStateFlow("7.2")
    val cablePowerKw: StateFlow<String> = _cablePowerKw.asStateFlow()

    private val _cableVoltage = MutableStateFlow(220)
    val cableVoltage: StateFlow<Int> = _cableVoltage.asStateFlow()

    private val _cableLengthM = MutableStateFlow("20")
    val cableLengthM: StateFlow<String> = _cableLengthM.asStateFlow()

    private val _cableResult = MutableStateFlow<CableCalculationResult?>(null)
    val cableResult: StateFlow<CableCalculationResult?> = _cableResult.asStateFlow()

    // Breaker
    private val _selectedAppliance = MutableStateFlow("Варочная панель")
    val selectedAppliance: StateFlow<String> = _selectedAppliance.asStateFlow()

    private val _breakerResult = MutableStateFlow<BreakerCalculationResult?>(null)
    val breakerResult: StateFlow<BreakerCalculationResult?> = _breakerResult.asStateFlow()

    // Lighting
    private val _lightingRoomType = MutableStateFlow("Склад")
    val lightingRoomType: StateFlow<String> = _lightingRoomType.asStateFlow()

    private val _lightingAreaM2 = MutableStateFlow("150")
    val lightingAreaM2: StateFlow<String> = _lightingAreaM2.asStateFlow()

    private val _lightingHeightM = MutableStateFlow("6.0")
    val lightingHeightM: StateFlow<String> = _lightingHeightM.asStateFlow()

    private val _lightingResult = MutableStateFlow<LightingCalculationResult?>(null)
    val lightingResult: StateFlow<LightingCalculationResult?> = _lightingResult.asStateFlow()

    // Commercial proposal modal
    private val _commercialProposalText = MutableStateFlow<String?>(null)
    val commercialProposalText: StateFlow<String?> = _commercialProposalText.asStateFlow()

    // Order Success Alert
    private val _orderSubmitted = MutableStateFlow(false)
    val orderSubmitted: StateFlow<Boolean> = _orderSubmitted.asStateFlow()

    init {
        // Initial calculations
        recalculateCable()
        recalculateBreaker()
        recalculateLighting()

        // If chat is empty, insert welcome greeting
        viewModelScope.launch {
            repository.allChatMessages.collect { list ->
                if (list.isEmpty()) {
                    val welcomeMsg = """
                        Здравствуйте! Я ИИ-консультант интернет-магазина электротехники **ECT.kz** (ТОО «Электрокомплект», Казахстан).
                        
                        Я помогу вам выбрать электрооборудование без ожидания ответа менеджера:
                        • Рассчитаю сечение кабеля и ток по мощности техники
                        • Подберу номинал автоматического выключателя и УЗО
                        • Соберу спецификацию квартирного или коттеджного электрощита
                        • Рассчитаю количество LED светильников для склада или офиса
                        • Найду аналоги оборудования в наличии на складах Алматы и Астаны
                        
                        Задайте вопрос или выберите готовую тему ниже!
                    """.trimIndent()
                    repository.getAndSaveAiReply(
                        history = emptyList(),
                        userPrompt = "Привет, помоги выбрать электротовары на сайте ECT.kz"
                    )
                }
            }
        }
    }

    // --- Chat Actions ---
    fun updateChatInput(text: String) {
        _chatInput.value = text
    }

    fun sendMessage(userText: String? = null) {
        val prompt = (userText ?: _chatInput.value).trim()
        if (prompt.isEmpty() || _isAiTyping.value) return

        _chatInput.value = ""
        viewModelScope.launch {
            _isAiTyping.value = true
            try {
                // Save user message
                repository.sendUserMessage(prompt)

                // Build history
                val history = chatMessages.value.map { it.isUser to it.text }
                repository.getAndSaveAiReply(history, prompt)
            } finally {
                _isAiTyping.value = false
            }
        }
    }

    fun clearChatHistory() {
        viewModelScope.launch {
            repository.clearChat()
        }
    }

    // --- Catalog Actions ---
    fun setSearchQuery(query: String) {
        _filterState.value = _filterState.value.copy(searchQuery = query)
    }

    fun selectCategory(category: ProductCategory?) {
        _filterState.value = _filterState.value.copy(selectedCategory = category)
    }

    fun selectBrand(brand: String?) {
        _filterState.value = _filterState.value.copy(selectedBrand = brand)
    }

    fun setSortBy(sort: CatalogSort) {
        _filterState.value = _filterState.value.copy(sortBy = sort)
    }

    fun showProductDetails(product: Product) {
        _selectedProductDetails.value = product
    }

    fun closeProductDetails() {
        _selectedProductDetails.value = null
    }

    fun askAiAboutProduct(product: Product, navigateToChat: () -> Unit) {
        _selectedProductDetails.value = null
        navigateToChat()
        sendMessage("Расскажи подробнее про ${product.name} (артикул: ${product.article}, бренд ${product.brand}). Для каких задач он подходит и какие сопутствующие товары к нему нужны?")
    }

    // --- Cart Actions ---
    fun addToCart(product: Product, quantity: Int = 1) {
        viewModelScope.launch {
            val existing = cartItems.value.find { it.product.id == product.id }
            val newQty = (existing?.quantity ?: 0) + quantity
            repository.addToCart(product.id, newQty)
        }
    }

    fun updateCartQuantity(productId: String, quantity: Int) {
        viewModelScope.launch {
            repository.updateCartQuantity(productId, quantity)
        }
    }

    fun removeFromCart(productId: String) {
        viewModelScope.launch {
            repository.removeFromCart(productId)
        }
    }

    fun clearCart() {
        viewModelScope.launch {
            repository.clearCart()
        }
    }

    fun toggleFavorite(productId: String) {
        viewModelScope.launch {
            val isFav = favorites.value.any { it.id == productId }
            repository.toggleFavorite(productId, isFav)
        }
    }

    fun generateProposal() {
        val text = repository.generateCommercialProposal(cartItems.value)
        _commercialProposalText.value = text
    }

    fun dismissProposal() {
        _commercialProposalText.value = null
    }

    fun submitOrder() {
        viewModelScope.launch {
            _orderSubmitted.value = true
            repository.clearCart()
        }
    }

    fun dismissOrderSuccess() {
        _orderSubmitted.value = false
    }

    // --- Calculators Actions ---
    fun updateCablePower(kw: String) {
        _cablePowerKw.value = kw
        recalculateCable()
    }

    fun updateCableVoltage(v: Int) {
        _cableVoltage.value = v
        recalculateCable()
    }

    fun updateCableLength(m: String) {
        _cableLengthM.value = m
        recalculateCable()
    }

    private fun recalculateCable() {
        val p = _cablePowerKw.value.toDoubleOrNull() ?: 7.2
        val l = _cableLengthM.value.toDoubleOrNull() ?: 20.0
        val v = _cableVoltage.value
        _cableResult.value = ElectricalCalculators.calculateCable(p, v, l)
    }

    fun updateAppliance(name: String) {
        _selectedAppliance.value = name
        recalculateBreaker()
    }

    private fun recalculateBreaker() {
        _breakerResult.value = ElectricalCalculators.calculateBreakerForAppliance(_selectedAppliance.value)
    }

    fun updateLightingRoom(room: String) {
        _lightingRoomType.value = room
        recalculateLighting()
    }

    fun updateLightingArea(area: String) {
        _lightingAreaM2.value = area
        recalculateLighting()
    }

    fun updateLightingHeight(h: String) {
        _lightingHeightM.value = h
        recalculateLighting()
    }

    private fun recalculateLighting() {
        val a = _lightingAreaM2.value.toDoubleOrNull() ?: 150.0
        val h = _lightingHeightM.value.toDoubleOrNull() ?: 6.0
        _lightingResult.value = ElectricalCalculators.calculateLighting(_lightingRoomType.value, a, h)
    }

    fun askAiByCableCalculation(navigateToChat: () -> Unit) {
        val res = _cableResult.value ?: return
        navigateToChat()
        sendMessage("Мне нужен кабель под нагрузку ${_cablePowerKw.value} кВт (${_cableVoltage.value}В, длина ${_cableLengthM.value}м). Расчет показал сечение ${res.recommendedSectionMm2} мм² и автомат ${res.recommendedBreakerA}А. Подбери всё необходимое из наличия в ECT.kz с артикулами и гофрой.")
    }

    fun askAiByLightingCalculation(navigateToChat: () -> Unit) {
        val res = _lightingResult.value ?: return
        navigateToChat()
        sendMessage("Рассчитай освещение для: ${_lightingRoomType.value}, площадь ${_lightingAreaM2.value} м², высота потолка ${_lightingHeightM.value} м. По расчету требуется ${res.fixtureCount} светильников (${res.recommendedFixtureType}). Подбери подходящие модели и проводку в каталоге ECT.kz.")
    }

    fun askAiByBreakerCalculation(navigateToChat: () -> Unit) {
        val res = _breakerResult.value ?: return
        navigateToChat()
        sendMessage("Подбери защитную автоматику для электроприбора: «${_selectedAppliance.value}». Требуется автомат ${res.nominalCurrentA}А (кривая ${res.characteristicCurve}) и проводка. Что порекомендуешь из брендов CHINT, IEK или DEKraft?")
    }
}
