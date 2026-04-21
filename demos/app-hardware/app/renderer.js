const { ipcRenderer } = require('electron');
const info = document.getElementById('info');
const btn = document.getElementById('open');
const floatBtn = document.getElementById('openFloat');
const snakeBtn = document.getElementById('openSnake');
const fileClipboardTestBtn = document.getElementById('fileClipboardTest');
const filePickerBtn = document.getElementById('filePicker');
const readClipboardBtn = document.getElementById('readClipboard');
const copyPathBtn = document.getElementById('copyPath');
const screenRecorderBtn = document.getElementById('openScreenRecorder');
const cameraBtn = document.getElementById('openCamera');
//created by AI
// 图片尺寸调节按钮
const imageResizerBtn = document.getElementById('openImageResizer');
//created by AI//
//created by AI
// 系统通知按钮
const notificationBtn = document.getElementById('openNotification');
//created by AI//
//created by AI
// IP地址获取按钮
const locationBtn = document.getElementById('openLocation');
//created by AI//
//created by AI
// 硬件信息按钮
const deviceInfoBtn = document.getElementById('openDeviceInfo');
//created by AI//
//created by AI
// OCR识别功能按钮
const ocrBtn = document.getElementById('openOCR');
//created by AI//

//created by AI
// web文件下载按钮
const webFileDownloadBtn = document.getElementById('webFileDownload');
//created by AI//

//created by AI
// 上传文件按钮
const uploadFileBtn = document.getElementById('uploadFile');
//created by AI//

//created by AI
// 打印预览按钮
const printPreviewBtn = document.getElementById('printPreview');
//created by AI//

const fileClipboardSection = document.getElementById('fileClipboardSection');
const filePathDisplay = document.getElementById('filePathDisplay');
const filePathElement = document.getElementById('filePath');
const clipboardDisplay = document.getElementById('clipboardDisplay');
const clipboardContentElement = document.getElementById('clipboardContent');

let selectedFilePath = '';

console.log('renderer.js loaded');
console.log('btn:', btn);
console.log('floatBtn:', floatBtn);
console.log('snakeBtn:', snakeBtn);
console.log('fileClipboardTestBtn:', fileClipboardTestBtn);
console.log('filePickerBtn:', filePickerBtn);
console.log('readClipboardBtn:', readClipboardBtn);
console.log('screenRecorderBtn:', screenRecorderBtn);
console.log('cameraBtn:', cameraBtn);
//created by AI
console.log('imageResizerBtn:', imageResizerBtn);
//created by AI//
//created by AI
console.log('notificationBtn:', notificationBtn);
//created by AI//
//created by AI
console.log('locationBtn:', locationBtn);
//created by AI//
//created by AI
console.log('deviceInfoBtn:', deviceInfoBtn);
//created by AI//
//created by AI
console.log('ocrBtn:', ocrBtn);
//created by AI//

//created by AI
console.log('webFileDownloadBtn:', webFileDownloadBtn);
//created by AI//

//created by AI
console.log('uploadFileBtn:', uploadFileBtn);
//created by AI//

//created by AI
console.log('printPreviewBtn:', printPreviewBtn);
//created by AI//

ipcRenderer.invoke('get-app-info').then((appInfo) => {
  info.textContent = '应用名称：' + appInfo.name + ' ｜ 版本：' + appInfo.version;
});

btn.addEventListener('click', () => {
  console.log('open-child button clicked');
  ipcRenderer.send('open-child');
});

floatBtn.addEventListener('click', () => {
  console.log('open-float button clicked');
  ipcRenderer.send('open-float');
});

snakeBtn.addEventListener('click', () => {
  console.log('open-snake button clicked');
  ipcRenderer.send('open-snake');
});

fileClipboardTestBtn.addEventListener('click', () => {
  console.log('fileClipboardTest button clicked');
  if (fileClipboardSection.classList.contains('hidden')) {
    fileClipboardSection.classList.remove('hidden');
  } else {
    fileClipboardSection.classList.add('hidden');
  }
});

filePickerBtn.addEventListener('click', () => {
  console.log('filePicker button clicked');
  ipcRenderer.send('open-file-picker');
});

copyPathBtn.addEventListener('click', () => {
  console.log('copyPath button clicked');
  if (selectedFilePath) {
    ipcRenderer.send('copy-to-clipboard', selectedFilePath);
    alert('文件路径已复制到剪贴板！');
  }
});

readClipboardBtn.addEventListener('click', () => {
  console.log('readClipboard button clicked');
  ipcRenderer.invoke('read-clipboard').then((content) => {
    clipboardContentElement.textContent = content || '剪贴板为空';
    clipboardDisplay.classList.remove('hidden');
  });
});

ipcRenderer.on('file-selected', (event, filePath) => {
  console.log('File selected:', filePath);
  selectedFilePath = filePath;
  filePathElement.textContent = filePath;
  filePathDisplay.classList.remove('hidden');
});

//created by AI
// 屏幕录制按钮事件
if (screenRecorderBtn) {
  screenRecorderBtn.addEventListener('click', () => {
    console.log('open-screen-recorder button clicked');
    ipcRenderer.send('open-screen-recorder');
  });
}

//created by AI
// 摄像头测试按钮事件
if (cameraBtn) {
  cameraBtn.addEventListener('click', () => {
    console.log('open-camera button clicked');
    ipcRenderer.send('open-camera');
  });
}
//created by AI//

//created by AI
// 图片尺寸调节按钮事件
if (imageResizerBtn) {
  imageResizerBtn.addEventListener('click', () => {
    console.log('open-image-resizer button clicked');
    ipcRenderer.send('open-image-resizer');
  });
}
//created by AI//

//created by AI
// 系统通知按钮事件
if (notificationBtn) {
  notificationBtn.addEventListener('click', () => {
    console.log('open-notification button clicked');
    ipcRenderer.send('open-notification');
  });
}
//created by AI//

//created by AI
// IP地址获取按钮事件
if (locationBtn) {
  locationBtn.addEventListener('click', () => {
    console.log('open-ip-window button clicked');
    ipcRenderer.send('open-ip-window');
  });
}
//created by AI//

//created by AI
// 硬件信息按钮事件
if (deviceInfoBtn) {
  deviceInfoBtn.addEventListener('click', () => {
    console.log('open-device-info button clicked');
    ipcRenderer.send('open-device-info');
  });
}
//created by AI//

//created by AI
// OCR识别功能按钮事件
if (ocrBtn) {
  ocrBtn.addEventListener('click', () => {
    console.log('open-ocr button clicked');
    ipcRenderer.send('open-ocr');
  });
}
//created by AI//

//created by AI
// web文件下载按钮事件
if (webFileDownloadBtn) {
  webFileDownloadBtn.addEventListener('click', () => {
    console.log('web-file-download button clicked');
    ipcRenderer.send('open-web-download');
  });
}
//created by AI//

//created by AI
// 上传文件按钮事件
if (uploadFileBtn) {
  uploadFileBtn.addEventListener('click', () => {
    console.log('upload-file button clicked');
    ipcRenderer.send('open-upload-file');
  });
}
//created by AI//

//created by AI
// 打印预览按钮事件
if (printPreviewBtn) {
  printPreviewBtn.addEventListener('click', () => {
    console.log('print-preview button clicked');
    ipcRenderer.send('open-print-preview');
  });
}
//created by AI//
