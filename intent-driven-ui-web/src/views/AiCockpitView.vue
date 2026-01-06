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
      <IdLayoutContent>
        <!-- 基本用法 -->
        <IdBubble content="Hello MateChat!" align="left" />
        <IdBubble content="Hello MateChat!" align="right" />
      </IdLayoutContent>
      <IdLayoutSender>
        <IdInput placeholder="请输入" v-model="inputValue" @send="handleInputSend" />
      </IdLayoutSender>
    </IdLayoutChat>
    <IdLayoutAside :show-aside="showRightPanel">
      <!-- <template v-if="">
        <component :is="loadComponent" v-bind="componentProps"></component>
      </template> -->
    </IdLayoutAside>
  </IdLayout>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import {
  IdLayout,
  IdLayoutChat,
  IdLayoutHeader,
  IdLayoutContent,
  IdLayoutSender,
  IdLayoutAside
} from '@/components/layout'
import { IdHeader } from '@/components/shared/Header'
import { IdBubble } from '@/components/shared/Bubble'
import { IdInput } from '@/components/shared/Input'

import { getComponentByName } from '@/components/modules/index'

onUnmounted(() => {
  // 销毁SSE
  closeSSE()
})

const showRightPanel = ref(false)

const togglePanel = () => {
  showRightPanel.value = !showRightPanel.value
}
const handleLogoClick = () => {
  console.log('Logo clicked!')
}

const handleSettings = () => {
  console.log('Settings clicked!')
}

const inputValue = ref('帮我查一下深圳今天的天气怎么样？有什么出行建议？')
// 输入框发送
const handleInputSend = (query: string) => {
  console.log('Input send:', query)
  connectSSE(query)
}

const curComponent = ref('CarList')
const componentProps = ref({
  columns: [
    { field: 'id', title: 'ID' },
    { field: 'name', title: '车辆名称' },
    { field: 'plateNumber', title: '车牌号' },
    { field: 'driver', title: '驾驶员' },
    { field: 'status', title: '状态' }
  ],
  data: [
    {
      id: '1',
      name: '奥迪 A6L',
      plateNumber: '京A 12345',
      driver: '张三',
      status: '行驶中'
    },
    {
      id: '2',
      name: '宝马 5系',
      plateNumber: '京B 67890',
      driver: '李四',
      status: '空闲'
    },
    {
      id: '3',
      name: '奔驰 E级',
      plateNumber: '京C 11111',
      driver: '王五',
      status: '维修中'
    }
  ]
})
const loadComponent = (name: string) => {
  return getComponentByName(name)
}

const myES = ref<EventSource | null>(null)
// SSE 请求
const connectSSE = async (query: string) => {
  if (myES.value) {
    console.log('SSE 已存在，请勿重复创建')
    return
  }
  // URL 参数编码，防止特殊字符导致问题
  const url = 'http://localhost:8000/chat/agentSSE?query=' + encodeURIComponent(query)
  console.log('🔗 连接 SSE:', url)

  const es = new EventSource(url)

  // 监听连接打开事件
  es.onopen = () => {
    console.log('✅ SSE 连接已建立')
  }

  es.onmessage = (event) => {
    try {
      console.log('📨 Raw SSE data:', event.data)
      const data = JSON.parse(event.data)
      console.log('📦 Parsed SSE event:', data)

      // 根据事件类型处理
      switch (data.event_type) {
        case 'llm_start':
          console.log('🤖 AI 开始生成:', data.content)
          break
        case 'llm_content':
          console.log('💬 AI 内容:', data.content)
          break
        case 'llm_end':
          console.log('✅ AI 生成完成')
          break
        case 'tool_call_start':
          console.log('🔧 调用工具:', data.tool_name, data.tool_args)
          break
        case 'tool_output':
          console.log('📤 工具返回:', data.content)
          break
        case 'tool_call_end':
          console.log('✅ 工具调用完成')
          break
        case 'stream_end':
          console.log('🏁 流结束:', data.content)
          es.close()
          myES.value = null
          break
        case 'error':
          console.error('❌ 错误:', data.content)
          break
        default:
          console.log('❓ 未知事件:', data)
      }
    } catch (error) {
      console.error('❌ 解析 SSE 数据失败:', error, 'Raw data:', event.data)
    }
  }

  es.onerror = (error) => {
    console.error('❌ SSE error:', error)
    console.log('EventSource readyState:', es.readyState)
    es.close()
    // 重置 myES，允许重新连接
    myES.value = null
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

<style scoped>
.main-container {
  min-height: 100vh;
}
</style>
