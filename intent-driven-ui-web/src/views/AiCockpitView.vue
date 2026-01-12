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
      <div v-if="allComponents && allComponents.length > 0">
        <div v-for="(item, index) in allComponents" :key="'conponent' + item.componentName + index">
          <component
            :is="loadComponent(item.componentName)"
            v-bind="{ data: item.data }"
          ></component>
        </div>
      </div>
    </IdLayoutAside>
  </IdLayout>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
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

const inputValue = ref('帮我评估车牌号粤B12345的贷款风险')
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
  const { componentName, data } = stepData

  curComponent.value = componentName
  componentProps.value = { data: data }
  nextTick(() => {
    togglePanel()
  })
}

const allComponents = ref<any[]>([
  // { code: 200, data: '2026-01-09 14:28:16' },
  // {
  //   code: 200,
  //   data: {
  //     car_id: 'CAR_1ECB4FB3',
  //     car_name: '蔚来ES6',
  //     car_number: '粤B12345',
  //     status: '离线',
  //     latitude: 22.551274,
  //     longitude: 114.120646,
  //     location_time: '2026-01-09 14:17:20',
  //     location_area: '罗湖区'
  //   },
  //   componentName: 'CarMap'
  // },
  // {
  //   code: 200,
  //   data: [
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_001',
  //       latitude: 22.54658,
  //       longitude: 114.115933,
  //       time: '2026-01-09 12:28:24',
  //       location_area: '罗湖区',
  //       sequence: 1
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_002',
  //       latitude: 22.56063,
  //       longitude: 114.129984,
  //       time: '2026-01-09 12:37:24',
  //       location_area: '罗湖区',
  //       sequence: 2
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_003',
  //       latitude: 22.55557,
  //       longitude: 114.116337,
  //       time: '2026-01-09 12:38:24',
  //       location_area: '罗湖区',
  //       sequence: 3
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_004',
  //       latitude: 22.552701,
  //       longitude: 114.102123,
  //       time: '2026-01-09 12:46:24',
  //       location_area: '罗湖区',
  //       sequence: 4
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_005',
  //       latitude: 22.552025,
  //       longitude: 114.109723,
  //       time: '2026-01-09 13:00:24',
  //       location_area: '罗湖区',
  //       sequence: 5
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_006',
  //       latitude: 22.550944,
  //       longitude: 114.106112,
  //       time: '2026-01-09 12:58:24',
  //       location_area: '罗湖区',
  //       sequence: 6
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_007',
  //       latitude: 22.556524,
  //       longitude: 114.111534,
  //       time: '2026-01-09 13:10:24',
  //       location_area: '罗湖区',
  //       sequence: 7
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_008',
  //       latitude: 22.566125,
  //       longitude: 114.104274,
  //       time: '2026-01-09 13:10:24',
  //       location_area: '罗湖区',
  //       sequence: 8
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_009',
  //       latitude: 22.546491,
  //       longitude: 114.122051,
  //       time: '2026-01-09 13:32:24',
  //       location_area: '罗湖区',
  //       sequence: 9
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_010',
  //       latitude: 22.535823,
  //       longitude: 114.103694,
  //       time: '2026-01-09 13:13:24',
  //       location_area: '罗湖区',
  //       sequence: 10
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_011',
  //       latitude: 22.531707,
  //       longitude: 114.088773,
  //       time: '2026-01-09 13:08:24',
  //       location_area: '福田区',
  //       sequence: 11
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_012',
  //       latitude: 22.534322,
  //       longitude: 114.094667,
  //       time: '2026-01-09 13:34:24',
  //       location_area: '福田区',
  //       sequence: 12
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_013',
  //       latitude: 22.519217,
  //       longitude: 114.101706,
  //       time: '2026-01-09 13:40:24',
  //       location_area: '罗湖区',
  //       sequence: 13
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_014',
  //       latitude: 22.512265,
  //       longitude: 114.094278,
  //       time: '2026-01-09 13:07:24',
  //       location_area: '福田区',
  //       sequence: 14
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_015',
  //       latitude: 22.534022,
  //       longitude: 114.109865,
  //       time: '2026-01-09 13:52:24',
  //       location_area: '罗湖区',
  //       sequence: 15
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_016',
  //       latitude: 22.543561,
  //       longitude: 114.09751,
  //       time: '2026-01-09 14:28:24',
  //       location_area: '罗湖区',
  //       sequence: 16
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_017',
  //       latitude: 22.544935,
  //       longitude: 114.088925,
  //       time: '2026-01-09 13:16:24',
  //       location_area: '福田区',
  //       sequence: 17
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_018',
  //       latitude: 22.528755,
  //       longitude: 114.108069,
  //       time: '2026-01-09 15:01:24',
  //       location_area: '罗湖区',
  //       sequence: 18
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_019',
  //       latitude: 22.532679,
  //       longitude: 114.09574,
  //       time: '2026-01-09 14:34:24',
  //       location_area: '罗湖区',
  //       sequence: 19
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_020',
  //       latitude: 22.516658,
  //       longitude: 114.090282,
  //       time: '2026-01-09 14:22:24',
  //       location_area: '福田区',
  //       sequence: 20
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_021',
  //       latitude: 22.536581,
  //       longitude: 114.078517,
  //       time: '2026-01-09 13:48:24',
  //       location_area: '福田区',
  //       sequence: 21
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_022',
  //       latitude: 22.5395,
  //       longitude: 114.062097,
  //       time: '2026-01-09 14:55:24',
  //       location_area: '福田区',
  //       sequence: 22
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_023',
  //       latitude: 22.548584,
  //       longitude: 114.063213,
  //       time: '2026-01-09 15:46:24',
  //       location_area: '福田区',
  //       sequence: 23
  //     },
  //     {
  //       trajectory_id: 'TRJ_CAR_1ECB4FB3_024',
  //       latitude: 22.532774,
  //       longitude: 114.076383,
  //       time: '2026-01-09 14:46:24',
  //       location_area: '福田区',
  //       sequence: 24
  //     }
  //   ],
  //   total: 24,
  //   car_number: '粤B12345',
  //   start_time: '2026-01-09 12:28:24',
  //   end_time: '2026-01-09 14:46:24',
  //   componentName: 'CarTrack'
  // }
])

const curComponent = ref('CarMap')
const componentProps = ref<any>({
  data: {
    car_id: 'CAR_1ECB4FB3',
    car_name: '蔚来ES6',
    car_number: '粤B12345',
    status: '离线',
    latitude: 22.532254,
    longitude: 114.150494,
    location_time: '2026-01-08 17:31:19',
    location_area: '罗湖区'
  }
})
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
    steps: { 0: '' }
  }

  chatMessages.value.push(aiMessage)

  // URL 参数编码，防止特殊字符导致问题
  const url = 'http://localhost:8000/chat/quickStart?query=' + encodeURIComponent(query)
  console.log('🔗 连接 SSE:', url)

  const es = new EventSource(url)

  // 监听连接打开事件
  es.onopen = () => {
    console.log('✅ SSE 连接已建立')
  }

  es.onmessage = (event) => {
    try {
      // console.log('📨 Raw SSE data:', event.data)
      const data = JSON.parse(event.data)
      // console.log('📦 Parsed SSE event:', data)
      const metadata = data.metadata || {}

      const langgraph_step = metadata.langgraph_step || null
      let content =
        aiMessage.steps && aiMessage.steps[langgraph_step] !== undefined
          ? aiMessage.steps[langgraph_step]
          : ''

      // 根据事件类型处理
      switch (data.event_type) {
        case 'llm_start':
          console.log('🤖 AI 开始生成:', data.content)
          break
        case 'llm_content':
          // console.log('💬 AI 内容:', data.content)
          content += data.content
          break
        case 'llm_end':
          console.log('✅ AI 生成完成')
          content += `\n\n[对话结束]\n\n`
          closeSSE()
          break
        case 'tool_call_start':
          console.log('🔧 调用工具:', data.tool_name, data.tool_args)
          content += `\n\n[调用工具: ${data.tool_name}]\n\n`
          break
        case 'tool_output':
          console.log('📤 工具返回:', data.content)
          allComponents.value.push(data.content)
          content += data.content
          break
        case 'tool_call_end':
          console.log('✅ 工具调用完成')
          content += `\n\n[工具调用结束]\n\n`
          break
        case 'stream_end':
          console.log('🏁 流结束:', data.content)
          break
        case 'error':
          console.error('❌ 错误:', data.content)
          break
        default:
          console.log('❓ 未知事件:', data)
      }
      aiMessage.steps = {
        ...aiMessage.steps,
        [langgraph_step]: content
      }
      chatMessages.value = [...chatMessages.value] // 触发视图更新
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
