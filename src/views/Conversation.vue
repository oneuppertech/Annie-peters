
<template>
  <main class="min-h-screen bg-[#faf9f7] px-4 py-8 sm:px-6">
    <div class="mx-auto max-w-3xl">

      <!-- Header -->
      <header class="mb-8 flex items-center justify-between">
        <a href="/" class="font-serif text-2xl font-semibold text-[#1e1a17]">
          Annie Peters
        </a>

        <a
          href="https://wa.me/2348084903580"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium text-[#8b6b4a] hover:underline"
        >
          Need help?
        </a>
      </header>

      <!-- Loading -->
      <section
        v-if="loading && !conversation"
        class="rounded-2xl border border-stone-200 bg-white p-10 text-center"
      >
        <div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-[#8b6b4a]"></div>
        <p class="text-sm text-stone-500">Loading your conversation...</p>
      </section>

      <!-- Unavailable -->
      <section
        v-else-if="pageError && !conversation"
        class="rounded-2xl border border-stone-200 bg-white p-8 text-center"
      >
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3m0 4h.01M10.3 3.9 1.8 18.5A1.7 1.7 0 0 0 3.3 21h17.4a1.7 1.7 0 0 0 1.5-2.5L13.7 3.9a2 2 0 0 0-3.4 0Z"
            />
          </svg>
        </div>

        <h1 class="font-serif text-2xl text-stone-900">
          Conversation unavailable
        </h1>

        <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
          {{ pageError }}
        </p>

        <a
          href="/"
          class="mt-6 inline-flex rounded-full bg-[#1e1a17] px-6 py-3 text-sm font-medium text-white hover:bg-[#39322d]"
        >
          Return to website
        </a>
      </section>

      <!-- Conversation -->
      <section
        v-else-if="conversation"
        class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
      >
        <!-- Conversation heading -->
        <div class="border-b border-stone-100 px-5 py-6 sm:px-7">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#a17c56]">
                Customer support
              </p>

              <h1 class="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">
                Your conversation
              </h1>

              <p class="mt-2 text-sm text-stone-500">
                Hello {{ conversation.name }}, continue your conversation with
                Annie Peters.
              </p>
            </div>

            <span
              class="rounded-full px-3 py-1.5 text-xs font-semibold capitalize"
              :class="statusClass"
            >
              {{ conversation.status.replace('_', ' ') }}
            </span>
          </div>

          <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500">
            <span>
              Enquiry: {{ conversation.enquiry_type }}
            </span>

            <span>
              Started {{ formatDate(conversation.created_at) }}
            </span>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="max-h-[580px] min-h-[300px] space-y-5 overflow-y-auto bg-[#fcfbf9] px-4 py-6 sm:px-7"
        >
          <div
            v-for="item in messages"
            :key="item.id"
            class="flex"
            :class="item.author_type === 'visitor' ? 'justify-end' : 'justify-start'"
          >
            <div class="max-w-[88%] sm:max-w-[78%]">
              <p
                class="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400"
                :class="item.author_type === 'visitor' ? 'text-right' : 'text-left'"
              >
                {{ item.author_type === 'visitor' ? 'You' : 'Annie Peters' }}
              </p>

              <div
                class="rounded-2xl px-4 py-3 text-sm leading-6"
                :class="
                  item.author_type === 'visitor'
                    ? 'rounded-br-sm bg-[#2b2520] text-white'
                    : 'rounded-bl-sm border border-stone-200 bg-white text-stone-700'
                "
              >
                <p class="whitespace-pre-wrap break-words">{{ item.body }}</p>
              </div>

              <p
                class="mt-1.5 text-[10px] text-stone-400"
                :class="item.author_type === 'visitor' ? 'text-right' : 'text-left'"
              >
                {{ formatDate(item.created_at) }}
              </p>
            </div>
          </div>

          <div
            v-if="messages.length === 0"
            class="py-10 text-center text-sm text-stone-400"
          >
            No messages yet.
          </div>
        </div>

        <!-- Reply form -->
        <div class="border-t border-stone-100 bg-white p-4 sm:p-6">
          <div
            v-if="conversation.status === 'spam'"
            class="rounded-xl bg-red-50 p-4 text-sm text-red-600"
          >
            Replies are disabled for this conversation.
          </div>

          <form
            v-else
            class="space-y-3"
            @submit.prevent="sendReply"
          >
            <label class="block text-sm font-semibold text-stone-800">
              Send a message
            </label>

            <textarea
              v-model="replyText"
              rows="3"
              maxlength="10000"
              placeholder="Write your message here..."
              class="w-full resize-none rounded-xl border border-stone-200 bg-[#fcfbf9] px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#a17c56] focus:ring-2 focus:ring-[#a17c56]/10"
            ></textarea>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-xs text-stone-400">
                Your replies are private to this conversation.
              </p>

              <button
                type="submit"
                :disabled="sending || !replyText.trim()"
                class="inline-flex items-center gap-2 rounded-full bg-[#2b2520] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#493e35] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  v-if="sending"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                ></span>

                {{ sending ? 'Sending...' : 'Send message' }}
              </button>
            </div>

            <p
              v-if="replyError"
              class="text-sm text-red-500"
            >
              {{ replyError }}
            </p>
          </form>
        </div>
      </section>

      <footer class="mt-8 text-center text-xs leading-6 text-stone-400">
        <p>© {{ new Date().getFullYear() }} Annie Peters.</p>
        <p>This is your private enquiry conversation link.</p>
      </footer>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'

import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase.js'

interface Conversation {
  id: string
  name: string
  enquiry_type: string
  message: string
  status: string
  created_at: string
  replies: Message[]
}

interface Message {
  id: string
  author_type: 'visitor' | 'admin'
  body: string
  created_at: string
}

const route = useRoute()

const token = computed(() => String(route.params.token || ''))

const loading = ref(true)
const sending = ref(false)

const conversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])

const replyText = ref('')
const replyError = ref('')
const pageError = ref('')

const messagesContainer = ref<HTMLElement | null>(null)

let refreshInterval: ReturnType<typeof setInterval> | null = null

const statusClass = computed(() => {
  switch (conversation.value?.status) {
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700'

    case 'in_progress':
      return 'bg-blue-50 text-blue-700'

    case 'spam':
      return 'bg-red-50 text-red-700'

    default:
      return 'bg-amber-50 text-amber-700'
  }
})

function formatDate(value: string) {
  if (!value) return ''

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

async function scrollToBottom() {
  await nextTick()

  if (messagesContainer.value) {
    messagesContainer.value.scrollTop =
      messagesContainer.value.scrollHeight
  }
}

async function loadConversation(showLoader = true) {
  if (!token.value) {
    pageError.value = 'This conversation link is invalid.'
    loading.value = false
    return
  }

  if (showLoader) loading.value = true

  try {
    const { data, error } = await supabase.functions.invoke(
      'public-conversation',
      {
        body: {
          action: 'get',
          token: token.value
        }
      }
    )

    if (error) {
      throw error
    }

    if (!data?.success || !data?.conversation) {
      throw new Error(
        data?.message || 'Unable to load this conversation.'
      )
    }

    // The deployed Edge Function returns data.conversation directly.
    const result = data.conversation as Conversation

    conversation.value = result

    // The original enquiry is the first visitor message.
    // The endpoint returns subsequent replies in conversation.replies.
    messages.value = [
      {
        id: result.id,
        author_type: 'visitor',
        body: result.message,
        created_at: result.created_at
      },
      ...(result.replies || [])
    ]

    pageError.value = ''

    await scrollToBottom()
  } catch (error: any) {
    console.error('Conversation loading error:', error)

    if (!conversation.value) {
      pageError.value =
        error?.message || 'This conversation link is invalid or has expired.'
    }
  } finally {
    loading.value = false
  }
}

async function sendReply() {
  const content = replyText.value.trim()

  if (!content || sending.value) return

  replyError.value = ''
  sending.value = true

  try {
    const { data, error } = await supabase.functions.invoke(
      'public-conversation',
      {
        body: {
          action: 'reply',
          token: token.value,

          // Important: deployed endpoint expects "body", not "message".
          body: content
        }
      }
    )

    if (error) throw error

    if (!data?.success || !data?.reply) {
      throw new Error(data?.message || 'Unable to send your reply.')
    }

    // The deployed endpoint returns the inserted reply as data.reply.
    messages.value.push(data.reply as Message)

    replyText.value = ''

    if (conversation.value?.status === 'resolved') {
      conversation.value.status = 'in_progress'
    }

    await scrollToBottom()

    // Refresh from server to keep the conversation in sync.
    await loadConversation(false)
  } catch (error: any) {
    console.error('Reply submission error:', error)

    replyError.value =
      error?.message || 'Your message could not be sent. Please try again.'
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await loadConversation()

  refreshInterval = setInterval(() => {
    if (!sending.value) {
      loadConversation(false)
    }
  }, 15000)
})

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})
</script>
