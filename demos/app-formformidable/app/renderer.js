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

//created by AI
// 图片编辑按钮
const imageEditorBtn = document.getElementById('openImageEditor');
//created by AI//

//created by AI
// lodash三方库调用按钮
const lodashBtn = document.getElementById('openLodash');
//created by AI//

//created by AI
// axios三方库调用按钮
const axiosBtn = document.getElementById('openAxios');
// moment三方库调用按钮
const momentBtn = document.getElementById('openMoment');
// express三方库调用按钮
const expressBtn = document.getElementById('openExpress');
// formidable三方库调用按钮
const formidableBtn = document.getElementById('openFormidable');
// 每日早报按钮
const zaobaoBtn = document.getElementById('openZaobao');
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

//created by AI
console.log('imageEditorBtn:', imageEditorBtn);
//created by AI//

//created by AI
console.log('lodashBtn:', lodashBtn);
//created by AI//

//created by AI
console.log('axiosBtn:', axiosBtn);
// moment三方库调用按钮日志
console.log('momentBtn:', momentBtn);
// 每日早报按钮日志
console.log('zaobaoBtn:', zaobaoBtn);
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

//created by AI
// 图片编辑按钮事件
if (imageEditorBtn) {
  imageEditorBtn.addEventListener('click', () => {
    console.log('open-image-editor button clicked');
    ipcRenderer.send('open-image-editor');
  });
}
//created by AI//

//created by AI
// lodash三方库调用按钮事件
if (lodashBtn) {
  lodashBtn.addEventListener('click', () => {
    console.log('open-lodash button clicked');
    ipcRenderer.send('open-lodash');
  });
}
//created by AI//

//created by AI
// axios三方库调用按钮事件
if (axiosBtn) {
  axiosBtn.addEventListener('click', () => {
    console.log('open-axios button clicked');
    ipcRenderer.send('open-axios');
  });
}

// moment三方库调用按钮事件
if (momentBtn) {
  momentBtn.addEventListener('click', () => {
    console.log('open-moment button clicked');
    ipcRenderer.send('open-moment');
  });
}

// express三方库调用按钮事件
if (expressBtn) {
  expressBtn.addEventListener('click', () => {
    console.log('open-express button clicked');
    ipcRenderer.send('open-express');
  });
}

//created by AI
// formidable三方库调用按钮事件
if (formidableBtn) {
  formidableBtn.addEventListener('click', () => {
    console.log('open-formidable button clicked');
    ipcRenderer.send('open-formidable');
  });
}
//created by AI//

// 每日早报按钮事件
if (zaobaoBtn) {
  zaobaoBtn.addEventListener('click', () => {
    console.log('open-zaobao button clicked');
    ipcRenderer.send('open-zaobao');
  });
}
//created by AI//
