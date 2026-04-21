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
