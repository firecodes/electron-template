/**
 * 日历窗口打开功能 - 鸿蒙平台兼容性修复
 * 使用 invoke 替代 send 以提高兼容性
 */

/**
 * 打开日历窗口
 * 使用 ipcRenderer.invoke 确保在鸿蒙平台上的兼容性
 */
function openCalendar() {
    console.log('点击日历按钮，准备打开日历窗口');
    
    ipcRenderer.invoke('open-calendar')
        .then(result => {
            console.log('日历窗口打开结果:', result);
            if (result && result.success) {
                console.log('日历窗口成功打开');
            } else {
                console.warn('日历窗口打开返回异常结果:', result);
            }
        })
        .catch(error => {
            console.error('打开日历窗口失败:', error);
            alert('打开日历窗口失败: ' + error.message);
        });
}

/**
 * 替换原有的 openCalendar 函数
 */
window.openCalendar = openCalendar;
