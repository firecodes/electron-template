//created by AI
// OCR服务模块 - 提供图片选择功能
const { ipcMain, dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

// 监听"选择图片"请求（来自渲染进程）
ipcMain.handle('select-image-for-ocr', async (event) => {
  try {
    // 获取主窗口
    const mainWindow = BrowserWindow.fromWebContents(event.sender);
    
    // 打开文件选择器
    const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
      title: '选择图片文件',
      filters: [
        { name: 'Image Files', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp'] }
      ],
      properties: ['openFile']
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { canceled: true };
    }

    const imagePath = filePaths[0];
    const fileName = path.basename(imagePath);
    
    // 读取图片文件并转换为base64
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // 根据文件扩展名确定MIME类型
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/png';
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      case '.bmp':
        mimeType = 'image/bmp';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
    }
    
    // 返回图片数据
    const imageData = `data:${mimeType};base64,${imageBase64}`;
    
    return {
      canceled: false,
      fileName: fileName,
      imagePath: imagePath,
      imageData: imageData
    };
  } catch (error) {
    console.error('选择图片失败:', error);
    return {
      canceled: true,
      error: error.message
    };
  }
});

module.exports = {};
//created by AI//
