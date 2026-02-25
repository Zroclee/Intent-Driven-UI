import { onMounted, onUnmounted } from 'vue';
import { actionBus } from './ActionBus';

export function useAIAction() {
  /**
   * 注册事件：在组件挂载时注册，销毁时自动卸载
   */
  const registerAction = (name: string, handler: (payload: any) => Promise<void> | void) => {
    onMounted(() => actionBus.register(name, handler));
    onUnmounted(() => actionBus.unregister(name));
  };

  return {
    registerAction,
    execute: (actions: any[]) => actionBus.execute(actions),
    notifyNext: () => actionBus.notifyNext(),
  };
}