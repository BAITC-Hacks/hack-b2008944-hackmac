package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.CartItemEntity
import com.example.data.local.ChatMessageEntity
import com.example.data.local.FavoriteItemEntity
import com.example.data.model.EctCatalogData
import com.example.data.model.Product
import com.example.data.model.ProductCategory
import com.example.data.remote.GeminiApiClient
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

data class CartItemWithProduct(
    val product: Product,
    val quantity: Int
)

class EctRepository(
    private val database: AppDatabase,
    private val geminiApiClient: GeminiApiClient = GeminiApiClient()
) {
    // --- Catalog ---
    fun getAllProducts(): List<Product> = EctCatalogData.products

    fun getProductById(id: String): Product? = EctCatalogData.getById(id)

    fun getProductsByCategory(category: ProductCategory): List<Product> =
        EctCatalogData.getByCategory(category)

    fun searchProducts(query: String): List<Product> =
        EctCatalogData.search(query)

    // --- Chat ---
    val allChatMessages: Flow<List<ChatMessageEntity>> =
        database.chatDao().getAllMessages()

    suspend fun sendUserMessage(text: String): Long {
        val entity = ChatMessageEntity(
            isUser = true,
            text = text,
            timestamp = System.currentTimeMillis()
        )
        return database.chatDao().insertMessage(entity)
    }

    suspend fun getAndSaveAiReply(
        history: List<Pair<Boolean, String>>,
        userPrompt: String
    ): Long {
        val result = geminiApiClient.getConsultantReply(history, userPrompt)
        val entity = ChatMessageEntity(
            isUser = false,
            text = result.replyText,
            timestamp = System.currentTimeMillis(),
            recommendedProductIds = result.recommendedProductIds.joinToString(",")
        )
        return database.chatDao().insertMessage(entity)
    }

    suspend fun clearChat() {
        database.chatDao().clearHistory()
    }

    // --- Cart ---
    val cartWithProducts: Flow<List<CartItemWithProduct>> =
        database.cartDao().getCartItems().map { list ->
            list.mapNotNull { entity ->
                val prod = EctCatalogData.getById(entity.productId)
                if (prod != null) CartItemWithProduct(prod, entity.quantity) else null
            }
        }

    suspend fun addToCart(productId: String, quantityDelta: Int = 1) {
        val currentItems = database.cartDao().getCartItems()
        // We'll insert or update
        database.cartDao().insertOrUpdate(
            CartItemEntity(
                productId = productId,
                quantity = quantityDelta,
                addedAt = System.currentTimeMillis()
            )
        )
    }

    suspend fun updateCartQuantity(productId: String, newQuantity: Int) {
        if (newQuantity <= 0) {
            database.cartDao().deleteItem(productId)
        } else {
            database.cartDao().insertOrUpdate(
                CartItemEntity(
                    productId = productId,
                    quantity = newQuantity,
                    addedAt = System.currentTimeMillis()
                )
            )
        }
    }

    suspend fun removeFromCart(productId: String) {
        database.cartDao().deleteItem(productId)
    }

    suspend fun clearCart() {
        database.cartDao().clearCart()
    }

    // --- Favorites ---
    val favorites: Flow<List<Product>> =
        database.favoriteDao().getFavorites().map { list ->
            list.mapNotNull { EctCatalogData.getById(it.productId) }
        }

    suspend fun toggleFavorite(productId: String, isCurrentlyFavorite: Boolean) {
        if (isCurrentlyFavorite) {
            database.favoriteDao().delete(productId)
        } else {
            database.favoriteDao().insert(FavoriteItemEntity(productId = productId))
        }
    }

    fun isFavorite(productId: String): Flow<Boolean> =
        database.favoriteDao().isFavorite(productId)

    // --- Commercial proposal / Смета generator ---
    fun generateCommercialProposal(cartItems: List<CartItemWithProduct>): String {
        val sb = StringBuilder()
        sb.append("=========================================\n")
        sb.append("КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ / СПЕЦИФИКАЦИЯ\n")
        sb.append("Интернет-магазин электротехники ECT.kz\n")
        sb.append("ТОО «Электрокомплект-1» (Казахстан)\n")
        sb.append("Дата: 2026 год\n")
        sb.append("=========================================\n\n")

        var total = 0
        cartItems.forEachIndexed { index, item ->
            val sum = item.product.priceKzt * item.quantity
            total += sum
            sb.append("${index + 1}. ${item.product.name}\n")
            sb.append("   Артикул: ${item.product.article} | Бренд: ${item.product.brand}\n")
            sb.append("   Количество: ${item.quantity} ${item.product.unit} x %,d ₸ = %,d ₸\n\n".format(item.product.priceKzt, sum).replace(',', ' '))
        }

        sb.append("-----------------------------------------\n")
        sb.append("ИТОГО К ОПЛАТЕ: %,d ₸\n".format(total).replace(',', ' '))
        sb.append("В том числе НДС 12%\n")
        sb.append("Самовывоз: склад Алматы / Астана либо доставка по всему Казахстану.\n")
        sb.append("Сформировано ИИ-консультантом ECT.kz\n")
        return sb.toString()
    }
}
