<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { supabase } from '@/services/supabase.js'

/* ---------- Config: swap these for your real paths / URLs ---------- */
const SHOP_URL = 'https://shop.anniepetars.com' // shop sub-domain app
const WHATSAPP = 'https://wa.me/2348084903580'
const EMAIL = 'fashion@anniepetars.com'
const PHONE = '+234 808 490 3580'
const A = (f) => `/assets/${f}` // assets folder helper

const navOpen = ref(false)
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 40)

onMounted(() => {
  AOS.init({
    duration: 900,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))



/* ---------- Measurement form (stays on page) ---------- */
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

/* ---------- Contact / newsletter ---------- */
/* ---------- Contact form ---------- */

const contact = reactive({
  name: '',
  email: '',
  type: 'General enquiry',
  message: ''
})

const contactSent = ref(false)
const contactSending = ref(false)
const contactError = ref('')

async function sendContact() {
  contactError.value = ''

  if (
    !contact.name.trim() ||
    !contact.email.trim() ||
    !contact.message.trim()
  ) {
    contactError.value = 'Please complete all required fields.'
    return
  }

  contactSending.value = true

  try {
    const { data, error } = await supabase.functions.invoke(
      'contact-messages',
      {
        body: {
          name: contact.name.trim(),
          email: contact.email.trim(),
          enquiry_type: contact.type,
          message: contact.message.trim()
        }
      }
    )

    if (error) {
      throw new Error(error.message || 'Unable to submit your enquiry.')
    }

    if (!data?.success) {
      throw new Error(data?.message || 'Unable to submit your enquiry.')
    }

    contactSent.value = true

    Object.assign(contact, {
      name: '',
      email: '',
      type: 'General enquiry',
      message: ''
    })

  } catch (error) {
    console.error('Contact submission error:', error)

    contactError.value =
      error.message || 'Something went wrong. Please try again.'
  } finally {
    contactSending.value = false
  }
}
const news = reactive({ email: '', done: false })
const joinNews = () => {
  if (!news.email) return
  // TODO: wire to mailing list
  news.done = true
}
</script>

<template>
   
<!-- CONTACT -->
    <section id="contact" class="bg-[#2A1B16] py-28 text-[#FFF7F1]">
      <div class="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2">
        <div data-aos="fade-right">
          <h2 class="font-display text-5xl leading-tight md:text-6xl">
            We would like to hear from you
          </h2>
          <p class="mt-5 max-w-md text-[#FFD9C2]">
            Collections, custom outfits, collaborations or press: tell us what you need and we will
            route it to the right person.
          </p>
          <ul class="mt-10 space-y-5">
            <li>
              <a :href="`mailto:${EMAIL}`" class="flex items-center gap-4 hover:text-[#FFC4A3]"
                ><i class="fa-regular fa-envelope w-6 text-xl"></i>{{ EMAIL }}</a
              >
            </li>
            <li>
              <a
                :href="`tel:${PHONE.replace(/\s/g, '')}`"
                class="flex items-center gap-4 hover:text-[#FFC4A3]"
                ><i class="fa-solid fa-phone w-6 text-xl"></i>{{ PHONE }}</a
              >
            </li>
            <li>
              <a
                :href="WHATSAPP"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-4 hover:text-[#FFC4A3]"
                ><i class="fa-brands fa-whatsapp w-6 text-xl"></i>Chat on WhatsApp</a
              >
            </li>
          </ul>
        </div>
       
<form
  class="space-y-4 rounded-[2rem] bg-[#3A251E] p-8"
  data-aos="fade-left"
  @submit.prevent="sendContact"
>
  <template v-if="!contactSent">

    <input
      v-model="contact.name"
      type="text"
      class="field-dark"
      placeholder="Full name"
      autocomplete="name"
      maxlength="120"
      required
    />

    <input
      v-model="contact.email"
      type="email"
      class="field-dark"
      placeholder="Email address"
      autocomplete="email"
      maxlength="254"
      required
    />

   <el-select
  v-model="contact.type"
  placeholder="Select enquiry type"
  class="contact-select w-full"
  size="large"
  popper-class="contact-select-dropdown"
>
  <el-option
    v-for="type in [
      'General enquiry',
      'Customer service',
      'Custom outfit',
      'Press / media',
      'Sponsorship',
      'Partnership',
      'Retail',
      'Event / exhibition'
    ]"
    :key="type"
    :label="type"
    :value="type"
  />
</el-select>

    <textarea
      v-model="contact.message"
      rows="5"
      class="field-dark"
      placeholder="Your message and any relevant dates"
      maxlength="5000"
      required
    ></textarea>

    <p
      v-if="contactError"
      class="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200"
      role="alert"
    >
      {{ contactError }}
    </p>

    <button
      type="submit"
      class="btn-peach w-full justify-center"
      :disabled="contactSending"
    >
      <i
        v-if="contactSending"
        class="fa-solid fa-spinner fa-spin mr-2"
      ></i>

      {{ contactSending ? 'Sending enquiry...' : 'Send your enquiry' }}
    </button>

  </template>

  <div
    v-else
    class="py-10 text-center"
    role="status"
  >
    <i class="fa-solid fa-circle-check mb-4 text-4xl text-[#FFC4A3]"></i>

    <h3 class="font-display text-3xl">
      Thank you!
    </h3>

    <p class="mt-3 text-[#FFD9C2]">
      Your enquiry has been received. Our team will be in touch.
    </p>

    <button
      type="button"
      class="btn-peach mt-6"
      @click="contactSent = false; contactError = ''"
    >
      Send another message
    </button>
  </div>
</form>

      </div>
    </section>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Manrope:wght@400;500;600&display=swap');

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

.ap .btn-peach,
.ap .btn-ghost,
.ap .btn-dark {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.85rem 1.6rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition:
    transform 0.3s,
    background 0.3s,
    box-shadow 0.3s;
}
.ap .btn-peach {
  background: #f59a6c;
  color: #2a1b16;
  box-shadow: 0 10px 30px -10px rgba(226, 120, 74, 0.7);
}
.ap .btn-peach:hover {
  background: #ffc4a3;
  transform: translateY(-3px);
}
.ap .btn-peach:disabled {
  opacity: 0.6;
  pointer-events: none;
}
.ap .btn-ghost {
  border: 1.5px solid #2a1b16;
}
.ap .btn-ghost:hover {
  background: #2a1b16;
  color: #fff7f1;
  transform: translateY(-3px);
}
.ap .btn-dark {
  background: #2a1b16;
  color: #fff7f1;
}
.ap .btn-dark:hover {
  background: #e2784a;
}

.ap .link-u {
  position: relative;
}
.ap .link-u::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  height: 1.5px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.35s;
}
.ap .link-u:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.ap .field,
.ap .field-dark {
  width: 100%;
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  transition:
    box-shadow 0.25s,
    border-color 0.25s;
}
.ap .field {
  background: #fff7f1;
  border: 1.5px solid transparent;
}
.ap .field:focus {
  border-color: #f59a6c;
  box-shadow: 0 0 0 4px rgba(245, 154, 108, 0.25);
  outline: none;
}
.ap .field-dark {
  background: #2a1b16;
  color: #fff7f1;
  border: 1.5px solid rgba(255, 196, 163, 0.2);
}
.ap .field-dark:focus {
  border-color: #ffc4a3;
  outline: none;
}

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

/* Hero load sequence */
.ap .rise {
  opacity: 0;
  transform: translateY(28px);
  animation: apRise 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--d, 0s);
}
.ap .rise-line {
  display: inline-block;
  transform: translateY(110%);
  animation: apLine 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--d, 0s);
}
@keyframes apRise {
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes apLine {
  to {
    transform: none;
  }
}

.ap .hero-frame {
  aspect-ratio: 4/5;
  overflow: hidden;
  border-radius: 14rem 14rem 2rem 2rem;
  background: #ffd9c2;
  box-shadow: 0 40px 80px -30px rgba(196, 98, 58, 0.5);
}
.ap .blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.7;
  animation: apDrift 14s ease-in-out infinite alternate;
}
.ap .blob-a {
  width: 32rem;
  height: 32rem;
  background: #ffc4a3;
  top: -6rem;
  right: -8rem;
}
.ap .blob-b {
  width: 24rem;
  height: 24rem;
  background: #ffe0cc;
  bottom: 0;
  left: -6rem;
  animation-delay: -6s;
}
@keyframes apDrift {
  to {
    transform: translate(40px, 30px) scale(1.15);
  }
}
.ap .float-card {
  animation: apFloat 6s ease-in-out infinite;
}
.ap .float-card-2 {
  animation: apFloat 7s ease-in-out infinite reverse;
}
@keyframes apFloat {
  50% {
    transform: translateY(-14px);
  }
}

.ap .marquee {
  display: flex;
  width: max-content;
  animation: apMarquee 30s linear infinite;
}
.ap .marquee-row {
  display: flex;
  gap: 2rem;
  padding-right: 2rem;
}
@keyframes apMarquee {
  to {
    transform: translateX(-50%);
  }
}

.ap .spin-badge {
  animation: apSpin 20s linear infinite;
}
@keyframes apSpin {
  to {
    transform: rotate(360deg);
  }
}
.ap .wa {
  animation: apPulse 2.4s infinite;
}
@keyframes apPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
  }
  70%,
  100% {
    box-shadow: 0 0 0 18px rgba(37, 211, 102, 0);
  }
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
.drop-enter-active,
.drop-leave-active {
  transition: all 0.35s;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
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

@media (prefers-reduced-motion: reduce) {
  .ap *,
  .ap *::before,
  .ap *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .ap .rise,
  .ap .rise-line {
    opacity: 1;
    transform: none;
  }
}
/* Element Plus contact select */
.ap .contact-select {
  width: 100%;
}

.ap .contact-select .el-select__wrapper {
  min-height: 52px;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: #2a1b16;
  box-shadow: 0 0 0 1.5px rgba(255, 196, 163, 0.2) inset;
}

.ap .contact-select .el-select__placeholder,
.ap .contact-select .el-select__selected-item {
  color: #fff7f1;
}

.ap .contact-select .el-select__placeholder {
  color: rgba(255, 247, 241, 0.65);
}

.ap .contact-select .el-select__wrapper.is-focused {
  box-shadow: 0 0 0 1.5px #ffc4a3 inset;
}

.ap .contact-select .el-select__caret {
  color: #ffc4a3;
}

.contact-select-dropdown {
  border-radius: 12px !important;
}

.contact-select-dropdown .el-select-dropdown__item {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.contact-select-dropdown .el-select-dropdown__item.is-selected {
  color: #b85d35;
  font-weight: 600;
}
</style>