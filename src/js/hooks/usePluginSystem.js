
import { ref, reactive,  isReactive, isRef  } from "vue";
import {api} from "@api/api";

import {ExtensionService} from "@extensions/core/ExtensionService";
import {InstantiationService, ServiceCollection} from "@extensions/core/Instantiation";
import {ActivationEvents} from "@extensions/core/ExtensionsRegistry";

class PluginSystem {
    // 存储所有 ref 的响应式对象，key 为 ref 名称，value 为组件实例
    // data= reactive({});
    // log= ref('')
    // title =  ref('choose-file')
    // src =  ref('')
    constructor() {

    }
    // 初始化插件系统
    async initializePluginSystem() {
        try {
            console.log('🔌 App: 开始初始化插件系统');

            // 检查扩展服务是否可用
            if (typeof ExtensionService === 'undefined') {
                console.error('❌ App: ExtensionService 未定义，插件系统核心模块可能未加载');
                return;
            }

            // 创建服务集合
            const services = new ServiceCollection();

            // 创建实例化服务
            const instantiationService = new InstantiationService(services);

            // 创建扩展服务
            const extensionService = instantiationService.createInstance(ExtensionService);

            // 初始化扩展服务
            await extensionService.initialize();

            // 保存到全局和应用实例
            window.extensionService = extensionService;
            window.instantiationService = instantiationService;
            this.extensionService = extensionService;
            this.instantiationService = instantiationService;

            console.log('✅ App: 扩展服务初始化成功');

            // 触发启动扩展激活事件
            await extensionService.activateByEvent(ActivationEvents.ON_START_UP);

            console.log('✅ App: 插件系统初始化完成');

        } catch (error) {
            console.error('❌ App: 插件系统初始化失败:', error);
            // 不抛出错误，让应用继续运行
        }
    }

    schedulePluginSystemInitialization() {
        const startPluginSystem = async () => {
            await this.initializePluginSystem();
            this.notifyPluginSystemReady();
        };

        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(() => {
                startPluginSystem().catch((error) => {
                    console.error('❌ App: 延迟初始化插件系统失败:', error);
                });
            }, {timeout: 2000});
            return;
        }

        setTimeout(() => {
            startPluginSystem().catch((error) => {
                console.error('❌ App: 延迟初始化插件系统失败:', error);
            });
        }, 300);
    }

    // 通知插件系统应用已完全初始化
    notifyPluginSystemReady() {
        try {
            // 触发应用就绪事件
            document.dispatchEvent(new CustomEvent('appReady', {
                detail: {
                    app: this,
                    components: this.components,
                    isInitialized: this.isInitialized
                }
            }));

            console.log('✅ App: 应用就绪事件已触发');
        } catch (error) {
            console.error('❌ App: 通知插件系统失败:', error);
        }
    }

}

export function usePluginSystem(){
  let useClass = new PluginSystem();

//   onReady(() => {
//    useClass.initKeyboardShortcuts();
//   });

//   // 页面卸载时清理监听
//   onUnmounted(() => {
//   })
  return useClass;
};
