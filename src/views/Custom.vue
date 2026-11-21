<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import ApiService from '@/services/api'

onMounted(() => {
  AOS.init({
    duration: 900,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
})

const steps = [
  {
    icon: 'fa-solid fa-pen-ruler',
    title: 'Tell us your idea',
    text: 'Share the outfit, occasion, fabric and the date you need it.'
  },
  {
    icon: 'fa-solid fa-ruler-combined',
    title: 'Send measurements',
    text: 'Use the form below. Same unit throughout.'
  },
  {
    icon: 'fa-solid fa-image',
    title: 'Add references',
    text: 'Photos or sketches that show the style you want.'
  },
  {
    icon: 'fa-solid fa-handshake',
    title: 'Agree and confirm',
    text: 'We confirm design, price, payment terms and timeline before production starts.'
  }
]

/* ---------- Measurement form ---------- */
const unit = ref('cm')
const garment = ref('dress')
const fields = {
  dress: [
    'Bust',
    'Underbust',
    'Waist',
    'Hips',
    'Shoulder width',
    'Across back',
    'Sleeve length',
    'Upper arm',
    'Wrist',
    'Garment length',
    'Height'
  ],
  trouser: [
    'Waist',
    'Hips',
    'Thigh',
    'Inside leg',
    'Outside leg',
    'Knee',
    'Ankle / hem',
    'Garment length'
  ]
}
const form = reactive({
  name: '',
  email: '',
  phone: '',
  country: '',
  outfit: '',
  fabric: '',
  colour: '',
  needBy: '',
  notes: '',
  accurate: false,
  terms: false
})
const measures = reactive({})
const files = ref([])
const status = ref('idle') // idle | sending | done | error
const errorMsg = ref('')
const MAX_MB = 8
const currentFields = computed(() => fields[garment.value])

/* ---------- Date picker (Vuetify) ---------- */
const dateMenu = ref(false)
const needByDate = ref(null)
const today = new Date()
today.setHours(0, 0, 0, 0)

const needByLabel = computed(() =>
  needByDate.value
    ? needByDate.value.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : ''
)

function onDatePick(d) {
  needByDate.value = d
  // local yyyy-mm-dd, avoids timezone shifting the day
  form.needBy = d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : ''
  dateMenu.value = false
}

/* ---------- Files + submit ---------- */
function onFiles(e) {
  const picked = Array.from(e.target.files || [])
  const ok = picked.filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf')
  if (ok.some((f) => f.size > MAX_MB * 1024 * 1024)) {
    errorMsg.value = `Each file must be under ${MAX_MB}MB.`
    return
  }
  errorMsg.value = ''
  files.value = ok.slice(0, 5)
}

/* ---------- Success celebration ---------- */
const root = ref(null)
const showSuccess = ref(false)
const requestRef = ref('')
const confettiCanvas = ref(null)
const closeBtn = ref(null)
let confettiRaf = 0

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Pages often scroll inside a layout wrapper rather than the window, so handle both
function scrollParents(el) {
  const list = []
  let n = el?.parentElement
  while (n) {
    if (/(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.scrollHeight > n.clientHeight) list.push(n)
    n = n.parentElement
  }
  return list
}

async function scrollToTop() {
  const behavior = prefersReduced() ? 'auto' : 'smooth'
  const targets = scrollParents(root.value)
  window.scrollTo({ top: 0, behavior })
  targets.forEach((t) => t.scrollTo({ top: 0, behavior }))
  const atTop = () => window.scrollY < 2 && targets.every((t) => t.scrollTop < 2)
  const start = performance.now()
  await new Promise((resolve) => {
    const tick = () =>
      atTop() || performance.now() - start > 1500 ? resolve() : requestAnimationFrame(tick)
    tick()
  })
}

async function celebrate(data) {
  requestRef.value =
    data?.request_number ?? data?.requestNumber ?? data?.request?.request_number ?? ''
  await scrollToTop()
  showSuccess.value = true
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onEsc)
  await nextTick()
  closeBtn.value?.focus()
  if (!prefersReduced()) launchConfetti()
}

function closeSuccess() {
  showSuccess.value = false
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onEsc)
  stopConfetti()
}
const onEsc = (e) => e.key === 'Escape' && closeSuccess()

function stopConfetti() {
  cancelAnimationFrame(confettiRaf)
  const c = confettiCanvas.value
  c?.getContext('2d')?.clearRect(0, 0, c.width, c.height)
}

function launchConfetti() {
  const canvas = confettiCanvas.value
  if (!canvas) return
  stopConfetti()
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const w = (canvas.width = window.innerWidth * dpr)
  const h = (canvas.height = window.innerHeight * dpr)
  const colors = ['#F59A6C', '#FFC4A3', '#E2784A', '#FFD9C2', '#C4623A', '#FFE6D6']
  const parts = []

  const add = (x, y, a, speed) =>
    parts.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      w: (6 + Math.random() * 6) * dpr,
      h: (4 + Math.random() * 5) * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      color: colors[(Math.random() * colors.length) | 0],
      round: Math.random() < 0.3,
      life: 0
    })
  const burst = (x, y, a0, a1, n) => {
    for (let i = 0; i < n; i++) add(x, y, a0 + Math.random() * (a1 - a0), (9 + Math.random() * 10) * dpr)
  }

  burst(0, h * 0.85, -1.3, -0.6, 60) // from bottom left
  burst(w, h * 0.85, -2.54, -1.84, 60) // from bottom right
  burst(w / 2, h * 0.35, 0, Math.PI * 2, 70) // centre pop

  const t0 = performance.now()
  const frame = (t) => {
    ctx.clearRect(0, 0, w, h)
    if (t - t0 < 1200 && Math.random() < 0.5) add(Math.random() * w, -10, Math.PI / 2, 3 * dpr) // light rain

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]
      p.vy += 0.35 * dpr
      p.vx *= 0.99
      p.vy *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life++
      if (p.y > h + 40 || p.life > 300) {
        parts.splice(i, 1)
        continue
      }
      ctx.save()
      ctx.globalAlpha = Math.min(1, (300 - p.life) / 60)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.h / 1.4, 0, Math.PI * 2)
        ctx.fill()
      } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    if (parts.length || t - t0 < 1200) confettiRaf = requestAnimationFrame(frame)
    else ctx.clearRect(0, 0, w, h)
  }
  confettiRaf = requestAnimationFrame(frame)
}

onBeforeUnmount(() => {
  stopConfetti()
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onEsc)
})
async function submitCustom() {
  if (!form.name || !form.email || !form.outfit) {
    errorMsg.value = 'Add your name, email and outfit type.'
    return
  }

  if (!form.accurate || !form.terms) {
    errorMsg.value = 'Please tick both confirmations.'
    return
  }

  errorMsg.value = ''
  status.value = 'sending'

  try {
    const body = new FormData()

    body.append('name', form.name)
    body.append('email', form.email)
    body.append('phone', form.phone)
    body.append('country', form.country)
    body.append('outfit', form.outfit)
    body.append('fabric', form.fabric)
    body.append('colour', form.colour)
    body.append('needBy', form.needBy)
    body.append('notes', form.notes)

    body.append('unit', unit.value)
    body.append('garment', garment.value)

    // Correct measurement variable
    body.append('measurements', JSON.stringify(measures))

    body.append('accurate', String(form.accurate))
    body.append('terms', String(form.terms))

    // Correct files variable
    for (const file of files.value) {
      body.append('files', file)
    }

     const response = await ApiService.upload('/custom-requests-submit', body)
    const data = response?.data ?? response // works whichever shape ApiService returns

    status.value = 'done'
    celebrate(data)
  } catch (error) {
    console.log('Custom request submission error:', error)
    console.log('Server response:', error)

    status.value = 'error'

    errorMsg.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'We could not send your request. Please try again or email us.'
  }
}

</script>

<template>
  <div class="ap">
    <!-- CUSTOM PROCESS + FORM -->
    <section id="custom" class="bg-[#FFE6D6] py-28">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mx-auto max-w-3xl text-center" data-aos="fade-up">
          <h2 class="font-display text-5xl leading-tight md:text-6xl">
            Your style. Your measurements.
          </h2>
          <p class="mt-5 text-[#5A413A]">
            Submitting the form is an enquiry only. It does not confirm an order. We review every
            request and agree the details with you first.
          </p>
        </div>

        <ol class="mt-14 grid gap-5 md:grid-cols-4">
          <li
            v-for="(s, i) in steps"
            :key="s.title"
            class="rounded-3xl bg-[#FFF7F1] p-6"
            data-aos="fade-up"
            :data-aos-delay="i * 100"
          >
            <span
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F59A6C] text-lg"
              ><i :class="s.icon"></i
            ></span>
            <h3 class="font-display text-xl">{{ i + 1 }}. {{ s.title }}</h3>
            <p class="mt-1 text-sm text-[#5A413A]">{{ s.text }}</p>
          </li>
        </ol>

        <div
          class="mx-auto mt-14 max-w-4xl rounded-[2rem] bg-white p-6 shadow-xl md:p-10"
          data-aos="fade-up"
        >
          <Transition name="swap" mode="out-in">
            <div v-if="status === 'done'" key="ok" class="py-16 text-center">
              <span
                class="pop mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFC4A3] text-3xl"
                ><i class="fa-solid fa-check"></i
              ></span>
              <h3 class="font-display text-3xl">Request received</h3>
              <p class="mx-auto mt-2 max-w-md text-[#5A413A]">
                Our team will review your design and measurements and contact you to confirm
                feasibility, price and timing.
              </p>
            </div>

            <form v-else key="form" class="space-y-10" novalidate @submit.prevent="submitCustom">
              <fieldset class="grid gap-4 md:grid-cols-2">
                <legend class="mb-4 font-display text-2xl">Tell us about your design</legend>
                <input
                  v-model="form.name"
                  class="field"
                  placeholder="Full name *"
                  autocomplete="name"
                />
                <input
                  v-model="form.email"
                  type="email"
                  class="field"
                  placeholder="Email address *"
                  autocomplete="email"
                />
                <input
                  v-model="form.phone"
                  class="field"
                  placeholder="Telephone with country code"
                  autocomplete="tel"
                />
                <input v-model="form.country" class="field" placeholder="Delivery country" />
                <input
                  v-model="form.outfit"
                  class="field"
                  placeholder="Outfit type or product reference *"
                />

                <!-- Vuetify date picker -->
                <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom start">
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="needByLabel"
                      label="Date needed"
                      readonly
                      hide-details
                      variant="solo-filled"
                      flat
                      class="peach-field"
                    >
                      <template #append-inner>
                        <i class="fa-regular fa-calendar text-[#E2784A]"></i>
                      </template>
                    </v-text-field>
                  </template>
                  <v-date-picker
                    :model-value="needByDate"
                    :min="today"
                    show-adjacent-months
                    hide-header
                    class="peach-picker"
                    @update:model-value="onDatePick"
                  />
                </v-menu>

                <input v-model="form.fabric" class="field" placeholder="Preferred fabric" />
                <input v-model="form.colour" class="field" placeholder="Preferred colour" />
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="field md:col-span-2"
                  placeholder="Design details, fit preferences, event date and location"
                ></textarea>
              </fieldset>

              <fieldset>
                <div
                  class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <legend class="font-display text-2xl">Your measurements</legend>

                  <div class="flex flex-col gap-3 min-[400px]:flex-row sm:items-center">
                    <div
                      class="seg flex w-full min-w-0 sm:w-auto"
                      role="group"
                      aria-label="Garment type"
                    >
                      <button
                        type="button"
                        class="flex-1 whitespace-nowrap text-center sm:flex-none"
                        :class="{ on: garment === 'dress' }"
                        @click="garment = 'dress'"
                      >
                        Dresses and fitted
                      </button>
                      <button
                        type="button"
                        class="flex-1 whitespace-nowrap text-center sm:flex-none"
                        :class="{ on: garment === 'trouser' }"
                        @click="garment = 'trouser'"
                      >
                        Trousers and skirts
                      </button>
                    </div>

                    <div class="seg flex w-full sm:w-auto" role="group" aria-label="Unit">
                      <button
                        type="button"
                        class="flex-1 sm:flex-none"
                        :class="{ on: unit === 'cm' }"
                        @click="unit = 'cm'"
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        class="flex-1 sm:flex-none"
                        :class="{ on: unit === 'in' }"
                        @click="unit = 'in'"
                      >
                        in
                      </button>
                    </div>
                  </div>
                </div>

                <p class="mb-5 text-sm text-[#5A413A]">
                  <i class="fa-solid fa-circle-info mr-2 text-[#E2784A]"></i>Use a flexible tape,
                  ideally with a helper. Keep it snug, not tight. Fill only what applies to your
                  garment.
                </p>
                <TransitionGroup name="fld" tag="div" class="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <label v-for="f in currentFields" :key="garment + f" class="block text-sm">
                    <span class="mb-1 block text-[#5A413A]">{{ f }}</span>
                    <span class="relative block">
                      <input
                        v-model="measures[garment + '-' + f]"
                        type="number"
                        min="0"
                        step="0.1"
                        inputmode="decimal"
                        class="field pr-10"
                      />
                      <span
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9B7A6E]"
                        >{{ unit }}</span
                      >
                    </span>
                  </label>
                </TransitionGroup>
              </fieldset>

              <fieldset>
                <legend class="mb-4 font-display text-2xl">Reference material</legend>
                <label
                  class="flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed border-[#F59A6C] bg-[#FFF7F1] p-8 text-center transition hover:bg-[#FFE6D6]"
                >
                  <i class="fa-solid fa-cloud-arrow-up mb-3 text-3xl text-[#E2784A]"></i>
                  <span>Upload photos, sketches or PDFs</span>
                  <span class="text-xs text-[#9B7A6E]"
                    >Up to 5 files, {{ MAX_MB }}MB each. References guide the design and do not
                    guarantee an exact copy.</span
                  >
                  <input
                    type="file"
                    class="sr-only"
                    multiple
                    accept="image/*,application/pdf"
                    @change="onFiles"
                  />
                </label>
                <ul v-if="files.length" class="mt-4 flex flex-wrap gap-2 text-sm">
                  <li v-for="f in files" :key="f.name" class="rounded-full bg-[#FFE6D6] px-3 py-1">
                    <i class="fa-regular fa-file mr-2"></i>{{ f.name }}
                  </li>
                </ul>
              </fieldset>

              <div class="space-y-3 text-sm">
                <label class="flex items-start gap-3"
                  ><input v-model="form.accurate" type="checkbox" class="mt-1 accent-[#E2784A]" /> I
                  confirm that the measurements supplied are accurate to the best of my
                  knowledge.</label
                >
                <label class="flex items-start gap-3"
                  ><input v-model="form.terms" type="checkbox" class="mt-1 accent-[#E2784A]" /> I
                  have read the <a href="/privacy-policy" class="underline">Privacy Policy</a> and
                  <a href="/customisation-terms" class="underline">Customisation Terms</a>.</label
                >
              </div>

              <p
                v-if="errorMsg"
                class="rounded-xl bg-[#FFE0D6] px-4 py-3 text-sm text-[#9A3412]"
                role="alert"
              >
                <i class="fa-solid fa-triangle-exclamation mr-2"></i>{{ errorMsg }}
              </p>

              <button class="btn-peach w-full justify-center py-4" :disabled="status === 'sending'">
                <i v-if="status === 'sending'" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
                {{ status === 'sending' ? 'Sending...' : 'Submit customisation request' }}
              </button>
            </form>
          </Transition>
        </div>
      </div>
    </section>
     <Transition name="celebrate">
    <div
      v-if="showSuccess"
      class="ap-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ap-success-title"
      @click.self="closeSuccess"
    >
      <div class="ap-modal-card">
        <span
          class="pop mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFC4A3] text-3xl"
          ><i class="fa-solid fa-check"></i
        ></span>
        <h3 id="ap-success-title" class="font-display text-3xl md:text-4xl">Request received</h3>
        <p class="mx-auto mt-3 max-w-sm text-[#5A413A]">
          Thank you. Our team will review your design and measurements and contact you to confirm
          feasibility, price and timing.
        </p>
        <p v-if="requestRef" class="mt-4 inline-block rounded-full bg-[#FFE6D6] px-4 py-1 text-sm">
          Reference <strong>{{ requestRef }}</strong>
        </p>
        <div>
          <button ref="closeBtn" class="btn-peach mt-7 justify-center px-10" @click="closeSuccess">
            Done
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <canvas ref="confettiCanvas" class="ap-confetti" aria-hidden="true"></canvas>
  </div>
</template>

<style>
.ap {
  font-family: 'Manrope', system-ui, sans-serif;
}
.ap .font-display {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 300;
}
.ap :focus-visible {
  outline: 2px solid #e2784a;
  outline-offset: 3px;
}

/* Buttons */
.ap .btn-peach {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.85rem 1.6rem;
  font-weight: 600;
  font-size: 0.9rem;
  background: #f59a6c;
  color: #2a1b16;
  box-shadow: 0 10px 30px -10px rgba(226, 120, 74, 0.7);
  transition:
    transform 0.3s,
    background 0.3s,
    box-shadow 0.3s;
}
.ap .btn-peach:hover {
  background: #ffc4a3;
  transform: translateY(-3px);
}
.ap .btn-peach:disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Fields */
.ap .field {
  width: 100%;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  background: #fff7f1;
  border: 1.5px solid transparent;
  transition:
    box-shadow 0.25s,
    border-color 0.25s;
}
.ap .field:focus {
  border-color: #f59a6c;
  box-shadow: 0 0 0 4px rgba(245, 154, 108, 0.25);
  outline: none;
}

/* Segmented toggles */
.ap .seg {
  display: inline-flex;
  background: #ffe6d6;
  border-radius: 999px;
  padding: 4px;
}
.ap .seg button {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  transition: all 0.3s;
}
.ap .seg button.on {
  background: #f59a6c;
  font-weight: 600;
}

.ap .pop {
  animation: apPop 0.6s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes apPop {
  from {
    transform: scale(0);
  }
}

/* Vue transitions */
.swap-enter-active,
.swap-leave-active {
  transition: all 0.4s;
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.fld-enter-active {
  transition: all 0.4s;
}
.fld-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

/* Vuetify date field (global: the menu renders outside this component) */
.peach-field .v-field {
  background: #fff7f1;
  border: 1.5px solid transparent;
  border-radius: 1rem;
  box-shadow: none;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
}
.peach-field .v-field--focused {
  border-color: #f59a6c;
  box-shadow: 0 0 0 4px rgba(245, 154, 108, 0.25);
}
.peach-field .v-label,
.peach-field .v-field--focused .v-label {
  color: #5a413a;
  opacity: 1;
}

/* Vuetify date picker */
.peach-picker {
  background: #fff7f1;
  color: #2a1b16;
  border-radius: 1.5rem;
  box-shadow: 0 20px 50px -20px rgba(42, 27, 22, 0.35);
}
.peach-picker .v-date-picker-month__day--selected .v-btn {
  background: #f59a6c !important;
  color: #2a1b16 !important;
}
.peach-picker .v-date-picker-month__day--today .v-btn {
  border-color: #f59a6c;
  color: #c4623a;
}
.peach-picker .v-date-picker-month__day .v-btn:hover {
  background: #ffe6d6;
}
.peach-picker .v-date-picker-controls .v-btn,
.peach-picker .v-date-picker-controls .v-btn .v-icon {
  color: #2a1b16;
}
.peach-picker .v-date-picker-years .v-btn--active,
.peach-picker .v-date-picker-months .v-btn--active {
  background: #f59a6c !important;
  color: #2a1b16 !important;
}

@media (prefers-reduced-motion: reduce) {
  .ap *,
  .ap *::before,
  .ap *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
/* Success popup + confetti */
.ap .ap-modal {
  position: fixed;
  inset: 0;
  z-index: 2100; /* above Vuetify menus (2000) */
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(42, 27, 22, 0.45);
  backdrop-filter: blur(3px);
}
.ap .ap-modal-card {
  width: min(460px, 100%);
  border-radius: 2rem;
  background: #fff7f1;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 30px 80px -30px rgba(42, 27, 22, 0.5);
}
.ap .ap-confetti {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2200;
}
.celebrate-enter-active,
.celebrate-leave-active {
  transition: opacity 0.3s;
}
.celebrate-enter-active .ap-modal-card,
.celebrate-leave-active .ap-modal-card {
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.celebrate-enter-from,
.celebrate-leave-to {
  opacity: 0;
}
.celebrate-enter-from .ap-modal-card,
.celebrate-leave-to .ap-modal-card {
  transform: translateY(28px) scale(0.95);
}
</style>
