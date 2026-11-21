
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

type TrackingStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

interface TrackingItem {
  name: string
  size: string | null
  colour: string | null
  quantity: number
}

interface TimelineEntry {
  status: string
  label: string
  description: string
  at: string | null
}

interface TrackingResponse {
  order_number: string
  status: TrackingStatus
  status_label: string
  payment_status: string
  currency: string
  delivery_method: string
  placed_at: string | null
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  estimated_delivery_date: string | null
  shipping: {
    provider: string | null
    tracking_number: string | null
    tracking_url: string | null
  }
  items: TrackingItem[]
  timeline: TimelineEntry[]
}

const route = useRoute()

const SUPABASE_URL =
  'https://gqomllacgzkdecqsdhwh.supabase.co'

const loading = ref(true)
const error = ref('')
const order = ref<TrackingResponse | null>(null)

const token = computed(() => String(route.params.token || ''))

const terminalStatuses = ['cancelled', 'refunded']

const statusSteps = [
  {
    key: 'placed',
    label: 'Order placed',
    description: 'Your order has been received.'
  },
  {
    key: 'paid',
    label: 'Payment confirmed',
    description: 'Your payment has been successfully confirmed.'
  },
  {
    key: 'processing',
    label: 'Preparing your order',
    description: 'Our team is carefully preparing your items.'
  },
  {
    key: 'ready_to_ship',
    label: 'Ready for dispatch',
    description: 'Your order is packed and ready to leave us.'
  },
  {
    key: 'shipped',
    label: 'On its way',
    description: 'Your order has been handed over for delivery.'
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Your order has reached its destination.'
  }
]

const statusOrder = [
  'pending_payment',
  'paid',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered'
]

const statusIndex = computed(() => {
  if (!order.value) return -1

  if (order.value.status === 'pending_payment') return 0

  return statusOrder.indexOf(order.value.status)
})

const isTerminal = computed(() =>
  terminalStatuses.includes(order.value?.status || '')
)

const isDelivered = computed(() => order.value?.status === 'delivered')

const heroMessage = computed(() => {
  if (!order.value) return ''

  const messages: Record<string, string> = {
    pending_payment: 'Your order is awaiting payment.',
    paid: 'Your payment is confirmed. Thank you!',
    processing: 'We are getting your order ready.',
    ready_to_ship: 'Your order is packed and ready.',
    shipped: 'A little closer to you. Your order is on its way!',
    delivered: 'Your order has arrived. Enjoy your purchase!',
    cancelled: 'This order has been cancelled.',
    refunded: 'Your refund has been recorded.'
  }

  return messages[order.value.status] || 'Your order has been updated.'
})

const formattedEta = computed(() =>
  formatDate(order.value?.estimated_delivery_date)
)

const formattedPlacedDate = computed(() =>
  formatDate(order.value?.placed_at)
)

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

function money(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: order.value?.currency || 'NGN',
    maximumFractionDigits: 0
  }).format(value)
}

function safeExternalUrl(value: string | null) {
  if (!value) return null

  try {
    const url = new URL(value)

    return ['https:', 'http:'].includes(url.protocol)
      ? url.toString()
      : null
  } catch {
    return null
  }
}

const courierUrl = computed(() =>
  safeExternalUrl(order.value?.shipping?.tracking_url || null)
)

function timelineIcon(status: string) {
  const icons: Record<string, string> = {
    placed: 'bag',
    pending_payment: 'clock',
    paid: 'check',
    processing: 'package',
    ready_to_ship: 'box',
    shipped: 'truck',
    delivered: 'home',
    cancelled: 'x',
    refunded: 'refresh'
  }

  return icons[status] || 'check'
}

function stepState(key: string) {
  if (!order.value) return 'upcoming'

  if (order.value.status === 'cancelled') {
    return key === 'placed' || key === 'paid' ? 'completed' : 'upcoming'
  }

  if (order.value.status === 'refunded') {
    return key === 'placed' || key === 'paid' ? 'completed' : 'upcoming'
  }

  if (key === 'placed') return 'completed'

  const index = statusOrder.indexOf(key)
  if (index === -1) return 'upcoming'

  if (statusIndex.value > index) return 'completed'
  if (statusIndex.value === index) return 'current'

  return 'upcoming'
}

async function loadOrder() {
  if (!token.value) {
    error.value = 'This tracking link is invalid.'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''
  order.value = null

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/public-order-tracking?token=${encodeURIComponent(token.value)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    )

    const body = await response.json()

    if (!response.ok) {
      throw new Error(
        body?.message ||
        body?.error ||
        body?.data?.message ||
        'We could not find this order.'
      )
    }

    const result = body?.data ?? body

    if (!result?.order_number) {
      throw new Error('The tracking response was incomplete.')
    }

    order.value = result as TrackingResponse
  } catch (err: unknown) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Unable to load your tracking details.'
  } finally {
    loading.value = false
  }
}

watch(token, loadOrder)

onMounted(loadOrder)
</script>

<template>
  <main class="tracking-page min-h-screen">
    <!-- Navigation -->
    <nav class="tracking-nav">
      <a href="/" class="brand">
        <span class="brand-mark">A</span>
        <span class="brand-name">ANNIE PETARS</span>
      </a>

      <a href="/" class="back-link">
        Continue shopping
        <span>↗</span>
      </a>
    </nav>

    <!-- Loading -->
    <section v-if="loading" class="page-container">
      <div class="loading-card">
        <div class="loader"></div>
        <h2>Finding your order</h2>
        <p>Please wait while we retrieve your tracking details.</p>
      </div>
    </section>

    <!-- Error -->
    <section v-else-if="error" class="page-container">
      <div class="error-card">
        <div class="error-icon">!</div>
        <p class="eyebrow">ORDER TRACKING</p>
        <h1>We couldn't find your order.</h1>
        <p>{{ error }}</p>
        <button class="primary-button" @click="loadOrder">
          Try again
        </button>
        <a href="/" class="text-link">Return to shop</a>
      </div>
    </section>

    <!-- Tracking content -->
    <template v-else-if="order">
      <!-- Hero -->
      <section class="hero-section">
        <div class="hero-orb hero-orb-one"></div>
        <div class="hero-orb hero-orb-two"></div>

        <div class="hero-content">
          <div class="hero-icon" :class="{ delivered: isDelivered, terminal: isTerminal }">
            <svg v-if="isDelivered" viewBox="0 0 24 24">
              <path d="m5 12 4 4L19 6" />
            </svg>

            <svg v-else-if="isTerminal" viewBox="0 0 24 24">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>

            <svg v-else viewBox="0 0 24 24">
              <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
              <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.5 5.2l9 4.6" />
            </svg>
          </div>

          <p class="eyebrow">YOUR ORDER, YOUR MOMENT</p>

          <h1>
            <template v-if="isDelivered">It's arrived!</template>
            <template v-else-if="isTerminal">Order update</template>
            <template v-else>It's on its way.</template>
          </h1>

          <p class="hero-description">{{ heroMessage }}</p>

          <div class="order-reference">
            <span>ORDER REFERENCE</span>
            <strong>{{ order.order_number }}</strong>
          </div>

          <div v-if="order.estimated_delivery_date && !isTerminal && !isDelivered"
               class="eta-card">
            <span class="eta-icon">✦</span>
            <div>
              <small>ESTIMATED DELIVERY</small>
              <strong>{{ formattedEta }}</strong>
            </div>
          </div>

          <div v-else-if="isDelivered" class="eta-card">
            <span class="eta-icon">♥</span>
            <div>
              <small>DELIVERY COMPLETED</small>
              <strong>{{ formatDate(order.delivered_at) }}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Main content -->
      <div class="page-container content-grid">
        <div class="main-column">
          <!-- Timeline -->
          <section class="content-card timeline-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">THE JOURNEY</p>
                <h2>Order progress</h2>
              </div>

              <span class="live-pill">
                <span class="live-dot"></span>
                Live updates
              </span>
            </div>

            <div v-if="isTerminal" class="terminal-notice">
              <span class="notice-icon">!</span>
              <div>
                <strong>
                  {{ order.status === 'cancelled' ? 'Order cancelled' : 'Refund recorded' }}
                </strong>
                <p>{{ heroMessage }}</p>
              </div>
            </div>

            <div class="timeline">
              <div
                v-for="(entry, index) in order.timeline"
                :key="`${entry.status}-${index}`"
                class="timeline-entry"
                :class="{
                  'timeline-entry-last': index === order.timeline.length - 1,
                  'timeline-entry-current': index === order.timeline.length - 1
                }"
                :style="{ '--entry-index': index }"
              >
                <div class="timeline-rail">
                  <div class="timeline-icon" :class="{
                    'icon-terminal': ['cancelled', 'refunded'].includes(entry.status),
                    'icon-current': index === order.timeline.length - 1
                  }">
                    <svg v-if="timelineIcon(entry.status) === 'check'" viewBox="0 0 24 24">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    <svg v-else-if="timelineIcon(entry.status) === 'truck'" viewBox="0 0 24 24">
                      <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
                      <circle cx="7.5" cy="18" r="1.5" />
                      <circle cx="17.5" cy="18" r="1.5" />
                    </svg>
                    <svg v-else-if="timelineIcon(entry.status) === 'home'" viewBox="0 0 24 24">
                      <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />
                    </svg>
                    <svg v-else-if="timelineIcon(entry.status) === 'bag'" viewBox="0 0 24 24">
                      <path d="M5 8h14l1 13H4zM9 8a3 3 0 0 1 6 0" />
                    </svg>
                    <svg v-else-if="timelineIcon(entry.status) === 'clock'" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    <svg v-else-if="timelineIcon(entry.status) === 'x'" viewBox="0 0 24 24">
                      <path d="m7 7 10 10M17 7 7 17" />
                    </svg>
                    <svg v-else-if="timelineIcon(entry.status) === 'refresh'" viewBox="0 0 24 24">
                      <path d="M20 7v5h-5M4 17v-5h5" />
                      <path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24">
                      <path d="m4 7 8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10" />
                    </svg>
                  </div>
                  <span v-if="index !== order.timeline.length - 1" class="timeline-line"></span>
                </div>

                <div class="timeline-body">
                  <div class="timeline-title-row">
                    <h3>{{ entry.label }}</h3>
                    <span v-if="index === order.timeline.length - 1" class="current-label">
                      Latest
                    </span>
                  </div>

                  <p>{{ entry.description }}</p>

                  <time v-if="entry.at">{{ formatDateTime(entry.at) }}</time>
                </div>
              </div>

              <div v-if="!order.timeline?.length" class="empty-timeline">
                Your order has been received. Updates will appear here as it progresses.
              </div>
            </div>
          </section>

          <!-- Courier -->
          <section v-if="order.delivery_method !== 'pickup'" class="content-card courier-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">DELIVERY DETAILS</p>
                <h2>Your delivery</h2>
              </div>
              <div class="courier-symbol">↗</div>
            </div>

            <div class="courier-info">
              <div class="courier-row">
                <span>Delivery partner</span>
                <strong>{{ order.shipping.provider || 'To be confirmed' }}</strong>
              </div>

              <div class="courier-row">
                <span>Tracking number</span>
                <strong class="tracking-number">
                  {{ order.shipping.tracking_number || 'Not yet available' }}
                </strong>
              </div>
            </div>

            <a
              v-if="courierUrl"
              :href="courierUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="courier-button"
            >
              Track with delivery partner
              <span>↗</span>
            </a>

            <p v-else class="courier-hint">
              Your courier tracking details will appear here once your order is dispatched.
            </p>
          </section>

          <section v-else class="content-card pickup-card">
            <span class="pickup-icon">⌖</span>
            <div>
              <p class="eyebrow">DELIVERY METHOD</p>
              <h2>Customer pickup</h2>
              <p>Your order is arranged for pickup. Please follow any collection instructions sent by our team.</p>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="side-column">
          <section class="content-card order-card">
            <p class="eyebrow">A LITTLE LOOK BACK</p>
            <h2>Your order</h2>

            <div class="order-date">
              <span>Placed on</span>
              <strong>{{ formattedPlacedDate }}</strong>
            </div>

            <div class="items-list">
              <div v-for="(item, index) in order.items" :key="index" class="item-row">
                <div class="item-thumbnail">
                  <span>AP</span>
                </div>

                <div class="item-details">
                  <strong>{{ item.name }}</strong>
                  <span>
                    <template v-if="item.size">{{ item.size }}</template>
                    <template v-if="item.size && item.colour"> · </template>
                    <template v-if="item.colour">{{ item.colour }}</template>
                  </span>
                  <small>Qty: {{ item.quantity }}</small>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <span>Payment status</span>
              <span class="payment-status" :class="{
                'payment-paid': order.payment_status === 'paid',
                'payment-pending': order.payment_status !== 'paid'
              }">
                {{ order.payment_status }}
              </span>
            </div>
          </section>

          <section class="help-card">
            <div class="help-decoration">✦</div>
            <p class="eyebrow">WE'RE HERE FOR YOU</p>
            <h2>Need a little help?</h2>
            <p>Questions about your order? Our team would love to help.</p>
            <a href="mailto:hello@anniepetars.com" class="help-button">
              Contact our team
              <span>↗</span>
            </a>
          </section>
        </aside>
      </div>
    </template>

    <!-- Footer -->
    <footer class="tracking-footer">
      <a href="/" class="footer-brand">ANNIE PETARS</a>
      <p>Made with love. Worn with confidence.</p>
      <span>© {{ new Date().getFullYear() }} Annie Petars</span>
    </footer>
  </main>
</template>

<style scoped>
.tracking-page {
  --cream: #fff7f1;
  --brown: #2a1b16;
  --peach: #f59a6c;
  --orange: #e2784a;
  --light-peach: #ffd9c2;
  --pale: #ffe6d6;
  --muted: #8b7065;
  --line: #f0ded2;
  background: var(--cream);
  color: var(--brown);
  font-family: 'Manrope', sans-serif;
  overflow: hidden;
}

.tracking-page * {
  box-sizing: border-box;
}

.tracking-nav {
  height: 78px;
  padding: 0 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 247, 241, .94);
  border-bottom: 1px solid rgba(42, 27, 22, .07);
  position: relative;
  z-index: 2;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
  color: var(--brown);
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--brown);
  color: white;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 21px;
}

.brand-name, .footer-brand {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .19em;
}

.back-link {
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  color: var(--brown);
  display: flex;
  gap: 9px;
  align-items: center;
}

.back-link span {
  color: var(--orange);
  font-size: 17px;
}

.hero-section {
  position: relative;
  overflow: hidden;
  min-height: 365px;
  padding: 55px 20px 65px;
  background: linear-gradient(130deg, #ffe6d6 0%, #ffd9c2 55%, #ffc4a3 100%);
  text-align: center;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 650px;
  margin: auto;
  animation: rise-in .75s ease both;
}

.hero-orb {
  position: absolute;
  border: 1px solid rgba(139, 73, 48, .12);
  border-radius: 50%;
  pointer-events: none;
}

.hero-orb-one {
  width: 340px;
  height: 340px;
  left: -120px;
  top: -190px;
}

.hero-orb-two {
  width: 450px;
  height: 450px;
  right: -150px;
  bottom: -310px;
}

.hero-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  border-radius: 22px;
  background: rgba(255, 247, 241, .72);
  display: grid;
  place-items: center;
  color: var(--orange);
  box-shadow: 0 12px 35px rgba(139, 73, 48, .09);
  animation: float 3.5s ease-in-out infinite;
}

.hero-icon svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.hero-icon.delivered {
  color: #36815c;
}

.hero-icon.terminal {
  color: #a94b42;
}

.eyebrow {
  color: var(--orange);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .2em;
  margin: 0 0 10px;
}

.hero-section h1,
.error-card h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(36px, 5vw, 54px);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -.035em;
  margin: 0;
}

.hero-description {
  margin: 13px auto 23px;
  color: #705349;
  font-size: 13px;
  line-height: 1.8;
}

.order-reference {
  display: inline-flex;
  gap: 13px;
  align-items: center;
  padding: 11px 16px;
  border: 1px solid rgba(42, 27, 22, .12);
  border-radius: 100px;
  background: rgba(255, 247, 241, .45);
}

.order-reference span,
.eta-card small {
  font-size: 8px;
  letter-spacing: .13em;
  font-weight: 800;
  color: var(--muted);
}

.order-reference strong {
  font-size: 11px;
  letter-spacing: .05em;
}

.eta-card {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  margin: 17px auto 0;
  padding: 11px 18px;
  border-radius: 14px;
  background: rgba(255, 247, 241, .75);
}

.eta-icon {
  font-size: 21px;
  color: var(--orange);
}

.eta-card div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.eta-card strong {
  font-size: 12px;
}

.page-container {
  width: min(1100px, calc(100% - 40px));
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, .85fr);
  gap: 24px;
  padding-top: 42px;
  padding-bottom: 70px;
  align-items: start;
}

.main-column, .side-column {
  display: grid;
  gap: 22px;
  min-width: 0;
}

.content-card {
  background: #fffdfb;
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 12px 35px rgba(75, 42, 28, .035);
  animation: rise-in .7s ease both;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 27px;
}

.section-heading h2,
.order-card h2,
.help-card h2,
.pickup-card h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 500;
  margin: 0;
}

.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 50px;
  padding: 7px 10px;
  color: #36815c;
  background: #edf7ef;
  font-size: 9px;
  font-weight: 800;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: #4a9a6e;
  border-radius: 50%;
  animation: pulse 1.8s infinite;
}

.timeline {
  padding-top: 4px;
}

.timeline-entry {
  display: flex;
  gap: 17px;
  min-height: 94px;
  animation: rise-in .55s ease both;
  animation-delay: calc(var(--entry-index) * 90ms);
}

.timeline-rail {
  width: 38px;
  flex: 0 0 38px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.timeline-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f6eee9;
  color: #aa9287;
  border: 1px solid #f0e3db;
  position: relative;
  z-index: 1;
  transition: .25s ease;
}

.timeline-icon svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.timeline-entry-current .timeline-icon {
  color: white;
  background: var(--orange);
  border-color: var(--orange);
  box-shadow: 0 0 0 5px #fff0e7;
  transform: scale(1.07);
}

.timeline-entry:not(.timeline-entry-current) .timeline-icon {
  color: #4c8a68;
  background: #edf6ef;
  border-color: #d9ebdc;
}

.timeline-icon.icon-terminal {
  color: #a94b42 !important;
  background: #fff0ed !important;
  border-color: #f5d8d3 !important;
}

.timeline-line {
  width: 1px;
  flex: 1;
  min-height: 48px;
  background: linear-gradient(to bottom, #e9c6b2, #f2e5dd);
}

.timeline-body {
  flex: 1;
  min-width: 0;
  padding: 5px 0 24px;
}

.timeline-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

.timeline-body h3 {
  font-size: 12px;
  font-weight: 800;
  margin: 0;
}

.timeline-body p {
  margin: 5px 0 7px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.7;
}

.timeline-body time {
  font-size: 9px;
  color: #aa958b;
}

.current-label {
  color: var(--orange);
  background: #fff0e7;
  border-radius: 30px;
  padding: 4px 8px;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.empty-timeline {
  padding: 20px;
  background: #fff7f1;
  border-radius: 14px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}

.terminal-notice {
  display: flex;
  gap: 12px;
  padding: 13px;
  margin-bottom: 23px;
  border-radius: 13px;
  background: #fff2ee;
  color: #9b5146;
}

.notice-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f9ded8;
  font-weight: 800;
}

.terminal-notice strong {
  font-size: 11px;
}

.terminal-notice p {
  margin: 4px 0 0;
  font-size: 10px;
  line-height: 1.6;
}

.courier-symbol {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #fff0e7;
  color: var(--orange);
  font-size: 19px;
}

.courier-info {
  border-top: 1px solid var(--line);
}

.courier-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.courier-row span {
  font-size: 11px;
  color: var(--muted);
}

.courier-row strong {
  text-align: right;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.tracking-number {
  letter-spacing: .04em;
}

.courier-button,
.help-button,
.primary-button {
  min-height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 18px;
  margin-top: 18px;
  border: 0;
  border-radius: 50px;
  background: var(--peach);
  color: var(--brown);
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
}

.courier-button:hover,
.help-button:hover,
.primary-button:hover {
  transform: translateY(-2px);
  background: var(--orange);
  color: white;
  box-shadow: 0 9px 20px rgba(226, 120, 74, .18);
}

.courier-hint {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.8;
}

.pickup-card {
  display: flex;
  gap: 17px;
  align-items: flex-start;
}

.pickup-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #fff0e7;
  color: var(--orange);
  font-size: 23px;
}

.pickup-card p:last-child {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.8;
}

.order-card h2 {
  margin-bottom: 18px;
}

.order-date {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.order-date span {
  color: var(--muted);
  font-size: 10px;
}

.order-date strong {
  font-size: 10px;
}

.items-list {
  display: grid;
}

.item-row {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}

.item-thumbnail {
  width: 48px;
  height: 58px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(145deg, #ffe6d6, #ffd2b8);
  color: #a85f43;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 18px;
}

.item-details {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
}

.item-details strong {
  font-size: 10px;
  line-height: 1.5;
}

.item-details span,
.item-details small {
  color: var(--muted);
  font-size: 9px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 17px;
}

.order-footer > span:first-child {
  color: var(--muted);
  font-size: 10px;
}

.payment-status {
  padding: 6px 10px;
  border-radius: 30px;
  font-size: 9px;
  font-weight: 800;
  text-transform: capitalize;
}

.payment-paid {
  background: #edf7ef;
  color: #36815c;
}

.payment-pending {
  background: #fff4e8;
  color: #a36b34;
}

.help-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 25px;
  background: var(--brown);
  color: #fff7f1;
}

.help-decoration {
  position: absolute;
  top: -17px;
  right: 15px;
  color: rgba(255, 217, 194, .15);
  font-size: 100px;
}

.help-card .eyebrow {
  color: var(--peach);
}

.help-card h2 {
  position: relative;
  font-size: 25px;
  max-width: 210px;
}

.help-card > p:not(.eyebrow) {
  color: #cdb7ac;
  font-size: 11px;
  line-height: 1.8;
  margin: 12px 0;
}

.help-button {
  background: var(--peach);
  width: 100%;
  margin-top: 18px;
}

.tracking-footer {
  padding: 27px 20px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.footer-brand {
  color: var(--brown);
  text-decoration: none;
}

.tracking-footer p,
.tracking-footer > span {
  margin: 0;
  color: var(--muted);
  font-size: 9px;
}

.loading-card,
.error-card {
  margin: 75px auto;
  max-width: 480px;
  padding: 45px 25px;
  text-align: center;
  background: #fffdfb;
  border: 1px solid var(--line);
  border-radius: 25px;
}

.loading-card h2,
.error-card h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
}

.loading-card p,
.error-card > p:not(.eyebrow) {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}

.loader {
  width: 35px;
  height: 35px;
  border: 3px solid #f3dfd3;
  border-top-color: var(--orange);
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin .8s linear infinite;
}

.error-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #fff0ed;
  color: #a94b42;
  font-size: 22px;
  font-weight: 800;
}

.error-card .eyebrow {
  margin-bottom: 10px;
}

.error-card h1 {
  font-size: 32px;
}

.error-card .primary-button {
  width: fit-content;
  margin: 22px auto 12px;
}

.text-link {
  display: block;
  color: var(--orange);
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(74, 154, 110, .25); }
  50% { box-shadow: 0 0 0 5px rgba(74, 154, 110, 0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 760px) {
  .tracking-nav {
    height: 65px;
    padding: 0 20px;
  }

  .brand-name {
    font-size: 10px;
  }

  .back-link {
    font-size: 10px;
  }

  .hero-section {
    min-height: 340px;
    padding: 45px 18px 50px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 17px;
    padding-top: 22px;
    padding-bottom: 45px;
  }

  .side-column {
    grid-row: auto;
  }

  .content-card {
    padding: 21px;
    border-radius: 20px;
  }

  .section-heading h2,
  .order-card h2 {
    font-size: 23px;
  }

  .timeline-entry {
    min-height: 90px;
  }

  .timeline-body {
    padding-bottom: 20px;
  }
}

@media (max-width: 380px) {
  .order-reference {
    gap: 8px;
    padding: 10px 12px;
  }

  .order-reference span {
    font-size: 7px;
  }

  .hero-section h1 {
    font-size: 36px;
  }

  .live-pill {
    font-size: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
</style>
