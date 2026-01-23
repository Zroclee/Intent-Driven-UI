<template>
  <IdLayout>
    <IdLayoutChat>
      <IdLayoutHeader>
        <IdHeader title="Intent Driven UI" :is-logo-clickable="true" @logo-click="handleLogoClick">
          <template #operation>
            <button @click="togglePanel">切换侧边栏</button>
            <button @click="handleSettings">设置</button>
          </template>
        </IdHeader>
      </IdLayoutHeader>
      <IdLayoutContent ref="messagesContainer">
        <!-- 基本用法 -->
        <IdBubble
          v-for="msg in chatMessages"
          :key="msg.id"
          :content="msg.content"
          :steps="msg.steps"
          :align="msg.role === 'user' ? 'right' : 'left'"
          @stepClick="handleBubbleStepClick"
        />
      </IdLayoutContent>
      <IdLayoutSender>
        <IdInput placeholder="请输入" v-model="inputValue" @send="handleInputSend" />
      </IdLayoutSender>
    </IdLayoutChat>
    <IdLayoutAside :show-aside="showRightPanel">
      <div v-for="(item, index) in allComponents" :key="'conponent' + item.componentName + index">
        <component :is="loadComponent(item.componentName)" v-bind="{ data: item.data }"></component>
      </div>
    </IdLayoutAside>
  </IdLayout>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, nextTick, watch } from 'vue'
import {
  IdLayout,
  IdLayoutChat,
  IdLayoutHeader,
  IdLayoutContent,
  IdLayoutSender,
  IdLayoutAside
} from '@/components/layout'
import { IdHeader } from '@/components/shared/Header'
import { IdBubble, type StepJsonData } from '@/components/shared/Bubble'
import { IdInput } from '@/components/shared/Input'

import { getComponentByName } from '@/components/modules/index'

onMounted(() => {
  curChatId.value = createChatId()
})

onUnmounted(() => {
  // 销毁SSE
  closeSSE()
})

const showRightPanel = ref(true)

const togglePanel = () => {
  showRightPanel.value = !showRightPanel.value
}
const handleLogoClick = () => {
  console.log('Logo clicked!')
}

const handleSettings = () => {
  console.log('Settings clicked!')
}

// 帮我评估车牌号粤B12345的贷款风险
// 帮我评估智慧茶园的贷款风险

const inputValue = ref('帮我评估智慧茶园的贷款风险')
// 输入框发送
const handleInputSend = (query: string) => {
  console.log('Input send:', query)
  //
  chatMessages.value.push({
    id: createId(),
    role: 'user',
    content: query
  })

  inputValue.value = ''

  connectSSE(query)
}

const handleBubbleStepClick = (stepData: StepJsonData) => {
  console.log('Step click:', stepData)
}

const allComponents = ref<any[]>([])

const loadComponent = (name: string) => {
  return getComponentByName(name)
}
interface TypeChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  steps?: { [key: number]: string }
}

const chatMessages = ref<Array<TypeChatMessage>>([
  {
    id: '1',
    role: 'assistant',
    content: 'Hello MateChat!'
  }
])

const createId = () => {
  return Math.random().toString(36).substring(2)
}

const curChatId = ref('')
/**
 * 生成唯一的对话ID
 * 优先使用 crypto.randomUUID()，否则使用 fallback 算法生成 UUID v4
 * @returns {string} UUID 格式的对话ID
 */
const createChatId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const messagesContainer = ref<InstanceType<typeof IdLayoutContent> | null>(null)

/**
 * 节流函数
 * @param fn 需要节流的函数
 * @param delay 延迟时间（毫秒）
 */
const throttle = (fn: Function, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastExecTime = 0
  return (...args: any[]) => {
    const now = Date.now()
    const remaining = delay - (now - lastExecTime)
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      fn(...args)
      lastExecTime = now
    } else if (!timer) {
      timer = setTimeout(() => {
        lastExecTime = Date.now()
        timer = null
        fn(...args)
      }, remaining)
    }
  }
}

/**
 * 滚动到底部
 * 自动将聊天区域滚动到最新消息处，带有节流处理
 */
const scrollToBottom = throttle(() => {
  nextTick(() => {
    if (messagesContainer.value && messagesContainer.value.$el) {
      const container = messagesContainer.value.$el
      container.scrollTop = container.scrollHeight
    }
  })
}, 200)

const myES = ref<EventSource | null>(null)
// SSE 请求
const connectSSE = async (query: string) => {
  if (myES.value) {
    console.log('SSE 已存在，请勿重复创建')
    return
  }

  const aiMessage: TypeChatMessage = {
    id: createId(),
    role: 'assistant',
    content: '',
    steps: {}
  }

  chatMessages.value.push(aiMessage)

  // URL 参数编码，防止特殊字符导致问题
  // quickStart
  // agriculture
  const url =
    'http://localhost:8000/chat/multiAgentGraph?query=' +
    encodeURIComponent(query) +
    '&chatId=' +
    curChatId.value
  console.log('🔗 连接 SSE:', url)

  const es = new EventSource(url)

  // 监听连接打开事件
  es.onopen = () => {
    console.log('✅ SSE 连接已建立')
  }

  let contentkey = 0
  let cacheId = ''

  es.onmessage = (event) => {
    try {
      // console.log('📨 Raw SSE data:', event.data)
      const data = JSON.parse(event.data)
      console.log('📦 Parsed SSE event:', data)
      const metadata = data.metadata

      let langgraph_step = ''
      let checkpoint_ns = ''

      if (metadata) {
        const step = metadata.langgraph_step
        langgraph_step = step !== undefined && step !== null ? String(step) : ''
        const ns = metadata.checkpoint_ns
        checkpoint_ns = ns !== undefined && ns !== null ? String(ns) : ''

        const currentId = checkpoint_ns + langgraph_step
        if (currentId !== cacheId) {
          contentkey += 1
          cacheId = currentId
        }
      } else {
        contentkey += 1
      }

      let content =
        aiMessage.steps && aiMessage.steps[contentkey] !== undefined
          ? aiMessage.steps[contentkey]
          : ''

      // 根据事件类型处理
      switch (data.event_type) {
        case 'llm_start':
          console.log('🤖 AI 开始生成:', data.content)
          allComponents.value = []
          break
        case 'llm_content':
          // console.log('💬 AI 内容:', data.content)
          content += data.content
          break
        case 'llm_end':
          console.log('✅ 大模型生成完成')
          // content += `\n\n[当前大模型对话结束]\n\n`

          break
        case 'tool_call_start':
          console.log('🔧 调用工具:', data.tool_name, data.tool_args)
          content += `\n\n[调用工具: ${data.tool_name}]\n\n`
          break
        case 'tool_output':
          console.log('📤 工具返回:', data.content)
          allComponents.value.push(JSON.parse(data.content))
          content += `\n\n[工具已返回数据]\n\n`
          break
        case 'tool_call_end':
          console.log('✅ 工具调用完成')
          content += `\n\n[工具调用结束]\n\n`
          break
        case 'stream_end':
          console.log('🏁 流结束:', data.content)
          content += `\n\n[对话完成]\n\n`
          closeSSE()
          break
        case 'error':
          console.error('❌ 错误:', data.content)
          content += `\n\n[对话出错]\n\n`
          closeSSE()
          break
        default:
          console.log('❓ 未知事件:', data)
      }
      aiMessage.steps = {
        ...aiMessage.steps,
        [contentkey]: content
      }
      chatMessages.value = [...chatMessages.value] // 触发视图更新
      scrollToBottom()
    } catch (error) {
      console.error('❌ 解析 SSE 数据失败:', error, 'Raw data:', event.data)
      aiMessage.content += '\n\n[接收数据解析错误]'
      closeSSE()
    }
  }

  es.onerror = (error) => {
    console.error('❌ SSE error:', error)
    // console.log('EventSource readyState:', es.readyState)
    aiMessage.content += '\n\n[接收数据解析错误]'
    closeSSE()
  }

  // 保存 EventSource 实例
  myES.value = es
}
const closeSSE = () => {
  if (myES.value) {
    myES.value.close()
    myES.value = null
  }
}
</script>

<style scoped></style>
