/**
 * 导出功能增强模块
 * 支持多种格式导出：TXT、JSON、HTML
 */

/**
 * 显示导出格式选择对话框
 */
function showExportDialog() {
    const contentDiv = document.getElementById('content');
    if (contentDiv.style.display === 'none') {
        alert('请先加载系统信息后再导出！');
        return;
    }

    // 创建自定义对话框
    const dialog = document.createElement('div');
    dialog.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 9999; min-width: 400px;';

    dialog.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #667eea; text-align: center;">选择导出格式</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button onclick="exportWithFormat('txt')" style="padding: 12px 20px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background='#667eea'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#667eea';">
                📄 导出为 TXT 文件
            </button>
            <button onclick="exportWithFormat('json')" style="padding: 12px 20px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background='#667eea'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#667eea';">
                📊 导出为 JSON 文件
            </button>
            <button onclick="exportWithFormat('html')" style="padding: 12px 20px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s;" onmouseover="this.style.background='#667eea'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#667eea';">
                🌐 导出为 HTML 文件
            </button>
            <button onclick="closeExportDialog()" style="padding: 12px 20px; border: 2px solid #999; background: white; color: #999; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s; margin-top: 10px;" onmouseover="this.style.background='#999'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#999';">
                ❌ 取消
            </button>
        </div>
    `;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9998;';
    
    overlay.onclick = closeExportDialog;

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    // 保存对话框引用
    window.exportDialog = dialog;
    window.exportOverlay = overlay;
}

/**
 * 关闭导出对话框
 */
function closeExportDialog() {
    if (window.exportDialog) {
        document.body.removeChild(window.exportDialog);
    }
    if (window.exportOverlay) {
        document.body.removeChild(window.exportOverlay);
    }
    window.exportDialog = null;
    window.exportOverlay = null;
}

/**
 * 使用指定格式导出
 */
async function exportWithFormat(format) {
    closeExportDialog();
    
    const contentDiv = document.getElementById('content');
    if (contentDiv.style.display === 'none') {
        alert('请先加载系统信息后再导出！');
        return;
    }

    try {
        const info = await ipcRenderer.invoke('get-system-info');
        const result = await ipcRenderer.invoke('export-to-file', info, format);

        if (result.success) {
            const formatNames = { 'txt': 'TXT', 'json': 'JSON', 'html': 'HTML' };
            alert('✅ 导出成功！\n格式: ' + formatNames[format] + '\n文件已保存到: ' + result.filePath);
        } else {
            alert('❌ 导出失败: ' + result.error);
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ 导出过程中发生错误: ' + error.message);
    }
}
