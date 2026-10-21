<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import rtwImage from '@/assets/rtw.png'
import contemporaryImage from '@/assets/contemporary.png'
import bridalImage from '@/assets/fob.png'
import asoEbiImage from '@/assets/aso-ebi.png'
import madeToMeasureImage from '@/assets/mtm.png'
import standImage from '@/assets/stand.png'
import girlChildImage from '@/assets/girl-child.png'
import newDesignImage from '@/assets/new-design.png'

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

const links = [
  { label: 'Collections', href: '#collections' },
  { label: 'Asana Kemuwa', href: '#designer' },
  { label: 'Custom Outfits', href: '#custom' },
  { label: 'Press', href: '#press' },
  { label: 'Contact', href: '#contact' }
]

const collections = [
  {
    name: "Annie's Ready-to-Wear",
    tag: 'A-RTW',
    line: 'Everyday style, thoughtfully designed.',
    img: rtwImage,
    slug: 'ready-to-wear',
    span: 'md:col-span-2 md:row-span-2'
  },
  {
    name: 'Contemporary African Suits',
    tag: 'Tailoring',
    line: 'African heritage meets modern tailoring.',
    img: contemporaryImage,
    slug: 'african-suits',
    span: ''
  },
  {
    name: 'Focus on the Bride',
    tag: 'Bridal',
    line: 'Designed for one of life’s meaningful moments.',
    img: bridalImage,
    slug: 'bridal',
    span: ''
  },
  {
    name: 'Aso Ebi Special',
    tag: 'Celebrations',
    line: 'Together in style, united by tradition.',
    img: asoEbiImage,
    slug: 'aso-ebi',
    span: ''
  },
  {
    name: 'Made-to-Measure',
    tag: 'Custom',
    line: 'Your measurements. Your preferences.',
    img: madeToMeasureImage,
    slug: 'made-to-measure',
    span: ''
  },
  {
    name: 'Stand Official 001',
    tag: 'Formal',
    line: 'A distinctive expression of presence and purpose.',
    img: standImage,
    slug: 'stand-official-001',
    span: ''
  },
  {
    name: 'The Girl Child Love',
    tag: 'Girls',
    line: 'Celebrating young girls through fashion and creativity.',
    img: girlChildImage,
    slug: 'girl-child',
    span: ''
  },
  {
    name: 'New Arrivals',
    tag: 'New',
    line: 'Fresh additions. Individual style.',
    img: newDesignImage,
    slug: 'new-arrivals',
    span: 'md:col-span-2'
  }
]

const values = [
  {
    icon: 'fa-solid fa-feather-pointed',
    title: 'Identity is part of the design',
    text: 'Every piece starts with respect for the colour, pattern and form found in African fashion.'
  },
  {
    icon: 'fa-solid fa-scissors',
    title: 'Heritage meets contemporary',
    text: 'African-inspired details, cut into modern proportions you can wear.'
  },
  {
    icon: 'fa-solid fa-user-check',
    title: 'Personal style has room',
    text: 'Selected designs can be adjusted to your fit, taste and occasion.'
  }
]

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

const pressItems = [
  {
    icon: 'fa-solid fa-newspaper',
    title: 'Press features',
    text: 'Verified coverage and interviews, linked to original sources.'
  },
  {
    icon: 'fa-solid fa-award',
    title: 'Awards',
    text: 'Confirmed awards and nominations, listed accurately.'
  },
  {
    icon: 'fa-solid fa-camera-retro',
    title: 'Exhibitions',
    text: 'Fashion presentations and showcases with event details.'
  },
  {
    icon: 'fa-solid fa-people-arrows',
    title: 'Collaborations',
    text: 'Photographers, stylists, retailers and cultural organisations.'
  }
]

const marquee = [
  'Prints',
  'Silhouettes',
  'Aso Ebi',
  'Bridal',
  'Tailoring',
  'Made-to-Measure',
  'Ready-to-Wear',
  'Heritage'
]

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
const currentFields = computed(() => fields[garment.value])

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

async function submitCustom() {
  if (!form.name || !form.email || !form.outfit)
    return (errorMsg.value = 'Add your name, email and outfit type.')
  if (!form.accurate || !form.terms) return (errorMsg.value = 'Please tick both confirmations.')
  errorMsg.value = ''
  status.value = 'sending'
  try {
    const body = new FormData()
    Object.entries(form).forEach(([k, v]) => body.append(k, v))
    body.append('unit', unit.value)
    body.append('garment', garment.value)
    body.append('measurements', JSON.stringify(measures))
    files.value.forEach((f) => body.append('files', f))
    // TODO: replace with your secure endpoint (e.g. Supabase edge function)
    // const res = await fetch('/api/custom-request', { method: 'POST', body })
    // if (!res.ok) throw new Error('Upload failed')
    await new Promise((r) => setTimeout(r, 900))
    status.value = 'done' // only shown after the server confirms receipt
  } catch (e) {
    status.value = 'error'
    errorMsg.value = 'We could not send your request. Please try again or email us.'
  }
}

/* ---------- Contact / newsletter ---------- */
const contact = reactive({ name: '', email: '', type: 'General enquiry', message: '' })
const contactSent = ref(false)
const sendContact = () => {
  if (!contact.name || !contact.email || !contact.message) return
  // TODO: wire to backend
  contactSent.value = true
}
const news = reactive({ email: '', done: false })
const joinNews = () => {
  if (!news.email) return
  // TODO: wire to mailing list
  news.done = true
}
</script>

<template>
  <div class="ap bg-[#FFF7F1] text-[#2A1B16] antialiased overflow-x-hidden">
    <!-- NAV -->
    <header
      class="fixed inset-x-0 top-0 z-50 bg-white transition-all duration-500"
      :class="scrolled ? 'shadow-[0_8px_30px_-12px_rgba(42,27,22,.18)] py-3' : 'py-5'"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6">
        <a href="#top" aria-label="AnniePetars home">
          <img
            src="../../src/assets/annie-peters-logo.png"
            alt="AnniePetars"
            class="w-auto transition-all duration-500"
            :class="scrolled ? 'h-9' : 'h-11'"
          />
        </a>
        <nav class="hidden items-center gap-9 text-sm lg:flex" aria-label="Primary">
          <a v-for="l in links" :key="l.href" :href="l.href" class="link-u">{{ l.label }}</a>
        </nav>
        <div class="hidden lg:block">
          <a :href="SHOP_URL" class="btn-peach"
            >Shop now <i class="fa-solid fa-bag-shopping ml-2 text-xs"></i
          ></a>
        </div>
        <button
          class="lg:hidden text-xl"
          :aria-expanded="navOpen"
          aria-label="Menu"
          @click="navOpen = !navOpen"
        >
          <i :class="navOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
        </button>
      </div>
      <Transition name="drop">
        <nav v-if="navOpen" class="lg:hidden mx-6 mt-4 rounded-3xl bg-white p-6 shadow-xl">
          <a
            v-for="l in links"
            :key="l.href"
            :href="l.href"
            class="block py-3 text-lg"
            @click="navOpen = false"
            >{{ l.label }}</a
          >
          <a :href="SHOP_URL" class="btn-peach mt-3 w-full justify-center">Shop now</a>
        </nav>
      </Transition>
    </header>

    <!-- HERO -->
    <section id="top" class="relative min-h-screen pt-32 pb-20">
      <div class="blob blob-a"></div>
      <div class="blob blob-b"></div>
      <div class="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <p
            class="rise mb-6 inline-flex items-center gap-2 rounded-full bg-[#FFE3D1] px-4 py-2 text-sm"
            style="--d: 0.1s"
          >
            <i class="fa-solid fa-sparkles text-[#E2784A]"></i> Founded by Asana Kemuwa
          </p>
          <h1 class="font-display text-[clamp(3rem,8vw,7.2rem)] leading-[.95] tracking-tight">
            <span class="block overflow-hidden"
              ><span class="rise-line" style="--d: 0.2s">African Heritage.</span></span
            >
            <span class="block overflow-hidden"
              ><span class="rise-line italic text-[#E2784A]" style="--d: 0.4s"
                >Contemporary</span
              ></span
            >
            <span class="block overflow-hidden"
              ><span class="rise-line" style="--d: 0.6s">Expression.</span></span
            >
          </h1>
          <p class="rise mt-8 max-w-xl text-lg leading-relaxed text-[#5A413A]" style="--d: 0.9s">
            Distinctive prints, considered silhouettes and thoughtful details, from everyday
            ready-to-wear to bridal, Aso Ebi and made-to-measure designs. Wear your story.
          </p>
          <div class="rise mt-10 flex flex-wrap gap-4" style="--d: 1.1s">
            <a href="#collections" class="btn-peach">Explore the collections</a>
            <a href="#custom" class="btn-ghost">Request a custom outfit</a>
          </div>
        </div>

        <div class="relative lg:col-span-5">
          <div class="hero-frame rise" style="--d: 0.5s">
            <img
              src="../assets/hero.png"
              alt="AnniePetars model wearing a contemporary African-inspired outfit"
              class="h-full w-full object-cover"
            />
          </div>
          <div
            class="float-card absolute -left-4 bottom-10 hidden rounded-2xl bg-white p-4 shadow-xl sm:block md:-left-10"
          >
            <p class="font-display text-3xl leading-none">5+ years</p>
            <p class="mt-1 text-xs text-[#5A413A]">Nigeria · UK · USA · Ghana</p>
          </div>
        </div>
      </div>
    </section>

    <!-- MARQUEE -->
    <div class="border-y border-[#2A1B16]/10 bg-[#FFD9C2] py-5" aria-hidden="true">
      <div class="marquee">
        <div v-for="n in 2" :key="n" class="marquee-row">
          <span
            v-for="m in marquee"
            :key="m + n"
            class="flex items-center gap-8 font-display text-3xl italic"
          >
            {{ m }} <i class="fa-solid fa-asterisk text-sm text-[#C4623A]"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- INTRO / PHILOSOPHY -->
    <section class="mx-auto max-w-7xl px-6 py-28">
      <div class="grid gap-16 lg:grid-cols-12">
        <div class="lg:col-span-5" data-aos="fade-right">
          <h2 class="font-display text-5xl leading-tight md:text-6xl">
            Where African identity meets contemporary fashion
          </h2>
          <p class="mt-6 text-[#5A413A] leading-relaxed">
            Clothing is personal communication. It can reflect your mood, culture, profession or
            celebration. We interpret African visual traditions with respect and curiosity, in cuts
            made for modern wardrobes.
          </p>
        </div>
        <div class="grid gap-6 lg:col-span-7">
          <div
            v-for="(v, i) in values"
            :key="v.title"
            data-aos="fade-up"
            :data-aos-delay="i * 120"
            class="group flex gap-6 rounded-3xl border border-[#2A1B16]/10 bg-white/60 p-7 transition hover:bg-[#FFE6D6]"
          >
            <span
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFC4A3] text-xl transition group-hover:rotate-6"
            >
              <i :class="v.icon"></i>
            </span>
            <div>
              <h3 class="font-display text-2xl">{{ v.title }}</h3>
              <p class="mt-1 text-[#5A413A]">{{ v.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COLLECTIONS -->
    <section id="collections" class="bg-[#2A1B16] py-28 text-[#FFF7F1]">
      <div class="mx-auto max-w-7xl px-6">
        <div class="mb-14 flex flex-wrap items-end justify-between gap-6" data-aos="fade-up">
          <h2 class="max-w-2xl font-display text-5xl leading-tight md:text-6xl">
            Signature designs. Distinctive identity.
          </h2>
          <a :href="SHOP_URL" class="btn-peach">Explore all collections</a>
        </div>
        <div class="grid auto-rows-[320px] gap-5 md:grid-cols-4">
          <a
            v-for="(c, i) in collections"
            :key="c.slug"
            :href="`${SHOP_URL}/collections/${c.slug}`"
            class="tile group relative overflow-hidden rounded-[2rem] bg-[#4A2F26]"
            :class="c.span"
            data-aos="zoom-in-up"
            :data-aos-delay="(i % 4) * 100"
          >
            <img
              :src="c.img"
              :alt="c.name"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition duration-[1200ms] group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-[#2A1B16]/90 via-[#2A1B16]/10 to-transparent"
            ></div>
            <span
              class="absolute left-5 top-5 rounded-full bg-[#FFC4A3] px-3 py-1 text-xs text-[#2A1B16]"
              >{{ c.tag }}</span
            >
            <div class="absolute inset-x-0 bottom-0 p-6">
              <h3 class="font-display text-2xl md:text-3xl">{{ c.name }}</h3>
              <p
                class="mt-1 max-h-0 overflow-hidden text-sm text-[#FFD9C2] opacity-0 transition-all duration-500 group-hover:max-h-16 group-hover:opacity-100"
              >
                {{ c.line }}
              </p>
            </div>
            <span
              class="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2A1B16] opacity-0 transition group-hover:opacity-100"
            >
              <i class="fa-solid fa-arrow-up-right-from-square text-sm"></i>
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- DESIGNER -->
    <section id="designer" class="mx-auto max-w-7xl px-6 py-28">
      <div class="grid items-center gap-16 lg:grid-cols-2">
        <div class="relative" data-aos="fade-right">
          <div class="aspect-[4/5] overflow-hidden rounded-t-[12rem] rounded-b-3xl bg-[#FFD9C2]">
            <img
              src="../assets/founder.png"
              alt="Asana Kemuwa, founder and creative designer"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div
            class="spin-badge absolute -bottom-6 -right-2 flex h-28 w-28 items-center justify-center rounded-full bg-[#F59A6C] text-center text-xs font-medium"
          >
            Wear<br />your<br />story
          </div>
        </div>
        <div data-aos="fade-left">
          <h2 class="font-display text-5xl leading-tight md:text-6xl">Meet Asana Kemuwa</h2>
          <p class="mt-2 text-[#C4623A]">Founder and Creative Designer</p>
          <p class="mt-6 leading-relaxed text-[#5A413A]">
            A BSc graduate in Sociology, Asana sees fashion as a way to express identity, culture
            and individuality. Her work explores the relationship between tradition and contemporary
            style through distinctive prints, carefully considered cuts and expressive silhouettes.
          </p>
          <p class="mt-4 leading-relaxed text-[#5A413A]">
            Over more than five years, AnniePetars has reached customers in Nigeria, the United
            Kingdom, the United States and Ghana, and continues to grow through new collections,
            collaborations and media opportunities.
          </p>
          <ul class="mt-8 space-y-3">
            <li
              v-for="p in [
                'Explore African-inspired patterns with respect for their context',
                'Develop distinctive, contemporary silhouettes',
                'Build lasting relationships with customers and creative partners'
              ]"
              :key="p"
              class="flex gap-3"
            >
              <i class="fa-solid fa-circle-check mt-1 text-[#E2784A]"></i><span>{{ p }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

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

            <form v-else key="form" class="space-y-10" @submit.prevent="submitCustom" novalidate>
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
                <input v-model="form.needBy" type="date" class="field" aria-label="Date needed" />
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
<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <legend class="font-display text-2xl">Your measurements</legend>

  <div class="flex flex-col gap-3 min-[400px]:flex-row sm:items-center">
    <!-- Garment type -->
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

    <!-- Measurement unit -->
    <div
      class="seg flex w-full sm:w-auto"
      role="group"
      aria-label="Unit"
    >
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

    <!-- PRESS -->
    <section id="press" class="mx-auto max-w-7xl px-6 py-28">
      <div class="mb-12 flex flex-wrap items-end justify-between gap-6" data-aos="fade-up">
        <h2 class="max-w-xl font-display text-5xl leading-tight md:text-6xl">
          AnniePetars in the fashion industry
        </h2>
        <a :href="`mailto:${EMAIL}`" class="btn-ghost">Contact the media team</a>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="(p, i) in pressItems"
          :key="p.title"
          class="rounded-3xl border border-[#2A1B16]/10 p-7 transition hover:-translate-y-2 hover:bg-[#FFE6D6]"
          data-aos="fade-up"
          :data-aos-delay="i * 100"
        >
          <i :class="p.icon" class="mb-5 text-2xl text-[#E2784A]"></i>
          <h3 class="font-display text-2xl">{{ p.title }}</h3>
          <p class="mt-2 text-sm text-[#5A413A]">{{ p.text }}</p>
        </article>
      </div>
      <p class="mt-8 max-w-2xl text-[#5A413A]" data-aos="fade-up">
        We welcome proposals from photographers, stylists, models, writers, retailers, event
        organisers and creative institutions. Send your project summary, timeline and audience to
        <a :href="`mailto:${EMAIL}`" class="underline">{{ EMAIL }}</a
        >.
      </p>
    </section>

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
            <input v-model="contact.name" class="field-dark" placeholder="Full name" />
            <input
              v-model="contact.email"
              type="email"
              class="field-dark"
              placeholder="Email address"
            />
            <select v-model="contact.type" class="field-dark" aria-label="Enquiry type">
              <option
                v-for="t in [
                  'General enquiry',
                  'Customer service',
                  'Custom outfit',
                  'Press / media',
                  'Sponsorship',
                  'Partnership',
                  'Retail',
                  'Event / exhibition'
                ]"
                :key="t"
              >
                {{ t }}
              </option>
            </select>
            <textarea
              v-model="contact.message"
              rows="4"
              class="field-dark"
              placeholder="Your message and any relevant dates"
            ></textarea>
            <button class="btn-peach w-full justify-center">Send your enquiry</button>
          </template>
          <p v-else class="py-10 text-center text-lg">
            <i class="fa-solid fa-circle-check mr-2 text-[#FFC4A3]"></i>Thank you. We will be in
            touch.
          </p>
        </form>
      </div>
    </section>

    <!-- NEWSLETTER + FOOTER -->
    <footer class="bg-[#FFC4A3] pt-20">
      <div class="mx-auto max-w-7xl px-6">
        <div class="grid items-center gap-8 pb-16 lg:grid-cols-2" data-aos="fade-up">
          <div>
            <h2 class="font-display text-4xl md:text-5xl">Be part of the AnniePetars story</h2>
            <p class="mt-3 max-w-md text-sm">
              Selected updates on collections, projects and events. Unsubscribe anytime. See our
              Privacy Policy.
            </p>
          </div>
          <form class="flex gap-2 rounded-full bg-white p-2" @submit.prevent="joinNews">
            <input
              v-model="news.email"
              type="email"
              class="min-w-0 flex-1 bg-transparent px-4 outline-none"
              placeholder="Enter your email address"
              aria-label="Email address"
            />
            <button class="btn-dark">{{ news.done ? 'Joined' : 'Join our mailing list' }}</button>
          </form>
        </div>
        <div
          class="flex flex-wrap items-center justify-between gap-6 border-t border-[#2A1B16]/20 py-8 text-sm"
        >
          <a href="#top" class="rounded-2xl bg-white px-5 py-3" aria-label="AnniePetars home">
            <img src="../assets/annie-peters-logo.png" alt="AnniePetars" class="h-10 w-auto" />
          </a>
          <p class="max-w-sm">
            Celebrating African heritage through contemporary fashion, distinctive design and
            individual expression.
          </p>
          <div class="flex gap-5 text-xl">
            <a :href="WHATSAPP" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a
            ><a :href="`mailto:${EMAIL}`" aria-label="Email"
              ><i class="fa-regular fa-envelope"></i
            ></a>
          </div>
        </div>
        <nav class="flex flex-wrap gap-x-6 gap-y-2 pb-10 text-xs" aria-label="Legal">
          <a
            v-for="l in [
              'Privacy Policy',
              'Cookie Policy',
              'Terms and Conditions',
              'Delivery and Shipping',
              'Returns and Refunds',
              'Customisation Terms',
              'Accessibility Statement'
            ]"
            :key="l"
            href="#"
            class="link-u"
            >{{ l }}</a
          >
        </nav>
      </div>
    </footer>

    <!-- Floating WhatsApp -->
    <a
      :href="WHATSAPP"
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      class="wa fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-xl"
    >
      <i class="fa-brands fa-whatsapp"></i>
    </a>
  </div>
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
</style>
