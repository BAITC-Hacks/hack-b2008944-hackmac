import { useEffect, useMemo, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''
const SESSION_KEY = 'ekt-assistant-session'
const CART_KEY = 'ekt-assistant-cart'

const demoProducts = [
  { id: 'bosch-gsh-11', title: 'Перфоратор Bosch GSH 11 E', article: '0 611 316 000', price: 189900, stock: 7, category: 'Инструмент', badge: 'Хит', icon: '⚒' },
  { id: 'makita-hr2470', title: 'Перфоратор Makita HR2470', article: 'HR2470', price: 86490, stock: 12, category: 'Инструмент', badge: 'Аналог', icon: '⚙' },
  { id: 'dewalt-d25133k', title: 'Перфоратор DeWalt D25133K', article: 'D25133K-QS', price: 119990, stock: 0, category: 'Инструмент', badge: 'Под заказ', icon: '◈' },
]

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Здравствуйте! Я помогу найти нужную запчасть или инструмент в каталоге EKT. Назовите артикул, товар или опишите задачу.',
    time: 'сейчас',
  },
]

function formatPrice(value) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₸`
}

function getSessionId() {
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const created = `demo-${crypto.randomUUID()}`
  localStorage.setItem(SESSION_KEY, created)
  return created
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) throw new Error(`API ${response.status}`)
  return response.json()
}

function demoChat(text) {
  const lowerText = text.toLowerCase()
  const found = demoProducts.filter((product) => lowerText.includes(product.article.toLowerCase()) || lowerText.includes(product.title.toLowerCase().split(' ')[1].toLowerCase()))
  const wantsDelivery = lowerText.includes('достав') || lowerText.includes('оплат')
  if (wantsDelivery) return { reply: 'Доставка по Казахстану доступна курьером и через пункты выдачи. Оплата — картой онлайн или при получении, если способ доступен для вашего города.' }
  if (found.length) return { reply: found[0].stock ? 'Нашёл подходящий вариант. Проверьте характеристики и добавьте его в корзину после подтверждения.' : 'Точной позиции сейчас нет в наличии. Показываю совместимый аналог.', products: found }
  if (lowerText.includes('перфоратор') || lowerText.includes('инструмент')) return { reply: 'Нашёл несколько вариантов. Точный остаток и цена указаны в карточках.', products: demoProducts }
  return { reply: 'Проверю каталог по этому запросу. Для точного результата можно прислать артикул или название детали.' }
}

function ProductCard({ product, onAdd }) {
  const isAvailable = product.stock > 0
  return (
    <article className="product-card">
      <div className="product-visual"><span>{product.icon || '▦'}</span><small>{product.category}</small></div>
      <div className="product-info">
        <div className="product-topline"><span className={`badge ${isAvailable ? 'badge-green' : 'badge-muted'}`}>{product.badge || (isAvailable ? 'В наличии' : 'Нет в наличии')}</span><span className="stock">{isAvailable ? `${product.stock} шт.` : 'ожидается'}</span></div>
        <h3>{product.title}</h3>
        <p className="article">Артикул {product.article}</p>
        <div className="product-bottom"><strong>{formatPrice(product.price)}</strong><button className="button button-dark button-small" onClick={() => onAdd(product)} disabled={!isAvailable}>{isAvailable ? 'Добавить' : 'Нет в наличии'}</button></div>
      </div>
    </article>
  )
}

function App() {
  const [sessionId] = useState(getSessionId)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState(readCart)
  const [pendingProduct, setPendingProduct] = useState(null)
  const messagesEndRef = useRef(null)

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  async function sendMessage(event, suggestedText = input) {
    event?.preventDefault()
    const text = suggestedText.trim()
    if (!text || isSending) return
    setInput('')
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text, time: 'сейчас' }])
    setIsSending(true)
    try {
      const data = API_URL ? await request('/chat', { method: 'POST', body: JSON.stringify({ sessionId, message: text }) }) : demoChat(text)
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: data.reply || data.message, products: data.products || [], suggestions: data.suggestions || [], time: 'сейчас' }])
    } catch {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: 'Не удалось связаться с каталогом. Попробуйте ещё раз через несколько секунд.', isError: true, time: 'сейчас' }])
    } finally {
      setIsSending(false)
    }
  }

  function requestAdd(product) {
    setPendingProduct(product)
  }

  async function confirmAdd() {
    if (!pendingProduct) return
    const product = pendingProduct
    try {
      if (API_URL) await request('/cart/add', { method: 'POST', body: JSON.stringify({ sessionId, productId: product.id, quantity: 1 }) })
      setCart((current) => {
        const existing = current.find((item) => item.id === product.id)
        return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
      })
      setPendingProduct(null)
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: `${product.title} добавлен в корзину.`, time: 'сейчас' }])
    } catch {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: 'Не получилось добавить товар. Проверьте остаток и повторите попытку.', isError: true, time: 'сейчас' }])
      setPendingProduct(null)
    }
  }

  function changeQuantity(productId, delta) {
    setCart((current) => current.map((item) => item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0))
  }

  return (
    <div className="app-shell">
      <header className="topbar"><div className="brand"><div className="brand-mark">E</div><div><strong>ekt<span>.kz</span></strong><small>умный подбор запчастей</small></div></div><div className="topbar-status"><span className="status-dot" /> Каталог онлайн <button className="icon-button" aria-label="Открыть корзину" onClick={() => setIsCartOpen(true)}>▱<b>{cartCount}</b></button></div></header>
      <main className="workspace">
        <section className="chat-panel">
          <div className="chat-heading"><div><p className="eyebrow">AI-КОНСУЛЬТАНТ · EKT</p><h1>Подберём нужное<br /><em>с первого раза.</em></h1></div><div className="agent-avatar">A<span /></div></div>
          <div className="conversation">
            <div className="date-divider"><span>сегодня</span></div>
            {messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}><div className={`avatar ${message.role}`}>{message.role === 'assistant' ? 'A' : 'Вы'}</div><div className="message-content"><div className={`message-bubble ${message.isError ? 'error' : ''}`}>{message.text}</div><span className="message-time">{message.time}</span>{message.products?.length > 0 && <div className="products-grid">{message.products.map((product) => <ProductCard key={product.id} product={product} onAdd={requestAdd} />)}</div>}{message.suggestions?.length > 0 && <div className="suggestions">{message.suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(null, suggestion)}>{suggestion}</button>)}</div>}</div></div>)}
            {isSending && <div className="message-row assistant"><div className="avatar assistant">A</div><div className="typing"><i /><i /><i /></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="composer-wrap"><div className="quick-actions"><button onClick={() => sendMessage(null, 'Найди перфоратор')}>Найти товар</button><button onClick={() => sendMessage(null, 'Как работает доставка?')}>Доставка и оплата</button><button onClick={() => setIsCartOpen(true)}>Моя корзина</button></div><form className="composer" onSubmit={sendMessage}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Напишите артикул или задачу..." aria-label="Сообщение ассистенту" /><button className="send-button" aria-label="Отправить сообщение" disabled={isSending || !input.trim()}>↑</button></form><p className="composer-note">Ассистент показывает только товары из каталога EKT · <span>Нужна помощь?</span></p></div>
        </section>
        <aside className="info-panel"><div className="info-kicker">КАК ЭТО РАБОТАЕТ</div><h2>Поиск, которому<br />можно <em>доверять.</em></h2><p className="info-intro">Ассистент сверяет наличие и цену в каталоге EKT, а не угадывает.</p><div className="trust-list"><div><b>01</b><span><strong>Живой каталог</strong><small>Остатки и цены проверяются перед ответом.</small></span></div><div><b>02</b><span><strong>Честный подбор</strong><small>Если товара нет, покажем совместимые аналоги.</small></span></div><div><b>03</b><span><strong>Вы решаете</strong><small>Добавление в корзину только после вашего «да».</small></span></div></div><div className="help-card"><div className="help-icon">?</div><div><strong>Не нашли ответ?</strong><p>Напишите артикул — разберёмся вместе.</p></div></div></aside>
      </main>
      {isCartOpen && <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">ВАША ПОКУПКА</p><h2>Корзина <span>{cartCount}</span></h2></div><button className="close-button" onClick={() => setIsCartOpen(false)}>×</button></div>{cart.length === 0 ? <div className="empty-cart"><div>▱</div><h3>Корзина пока пуста</h3><p>Добавьте товар из ответа ассистента.</p></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><div className="cart-item-icon">{item.icon || '▦'}</div><div className="cart-item-main"><strong>{item.title}</strong><small>{formatPrice(item.price)} · {item.article}</small><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}>+</button></div></div></div>)}</div><div className="cart-summary"><div><span>Итого</span><strong>{formatPrice(cartTotal)}</strong></div><button className="button button-dark button-wide">Перейти к оформлению <span>→</span></button><small>Ссылка на корзину появится после подключения backend.</small></div></>}</aside></div>}
      {pendingProduct && <div className="modal-backdrop"><div className="confirm-modal"><div className="modal-icon">✓</div><p className="eyebrow">ПОДТВЕРЖДЕНИЕ</p><h2>Добавить товар<br />в корзину?</h2><p>{pendingProduct.title}<br /><strong>{formatPrice(pendingProduct.price)}</strong></p><div className="modal-actions"><button className="button button-ghost" onClick={() => setPendingProduct(null)}>Отмена</button><button className="button button-dark" onClick={confirmAdd}>Да, добавить</button></div></div></div>}
    </div>
  )
}

export default App
