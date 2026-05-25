/**
 * 修复导出格式参数处理
 * 确保菜单栏的三个导出选项都能正确传递格式参数
 */

// 重新定义 export-system-info 事件监听器
ipcRenderer.removeAllListeners('export-system-info');

ipcRenderer.on('export-system-info', (event, format) => {
    console.log('收到导出命令，格式:', format);
    
    if (format && format !== 'txt') {
        exportWithFormat(format);
    } else {
        exportSystemInfo();
    }
});
