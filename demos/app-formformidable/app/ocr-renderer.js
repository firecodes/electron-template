//created by AI
// OCR识别功能渲染进程脚本 - 完整实现文件选择和OCR识别
const { ipcRenderer } = require('electron');

const recognizeBtn = document.getElementById('recognizeBtn');
const loading = document.getElementById('loading');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const emptyState = document.getElementById('emptyState');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const toast = document.getElementById('toast');

let currentFileName = '';

// 显示提示消息
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 加载Tesseract.js库
async function loadTesseractJS() {
    return new Promise((resolve, reject) => {
        if (typeof Tesseract !== 'undefined') {
            resolve();
            return;
        }
        
        console.log('开始加载Tesseract.js...');
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = () => {
            console.log('Tesseract.js loaded successfully');
            if (typeof Tesseract !== 'undefined') {
                resolve();
            } else {
                reject(new Error('Tesseract object not available'));
            }
        };
        script.onerror = () => {
            reject(new Error('Failed to load Tesseract.js'));
        };
        document.head.appendChild(script);
    });
}

// 使用Tesseract.js进行OCR识别
async function performOCR(imageData) {
    try {
        await loadTesseractJS();
        
        console.log('开始OCR识别...');
        
        const result = await Tesseract.recognize(
            imageData,
            'chi_sim+eng',
            {
                logger: m => {
                    console.log('OCR进度:', m.status, m.progress);
                    if (m.status === 'recognizing text') {
                        const loadingText = document.querySelector('.loading-text');
                        if (loadingText) {
                            loadingText.textContent = `正在识别中... ${Math.round(m.progress * 100)}%`;
                        }
                    }
                }
            }
        );
        
        console.log('OCR识别完成');
        return result.data.text;
    } catch (error) {
        console.error('OCR识别失败:', error);
        throw error;
    }
}

// 开始识别按钮
recognizeBtn.addEventListener('click', async () => {
    loading.classList.add('active');
    recognizeBtn.disabled = true;
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = '正在识别中，请稍候...';
    }
    
    try {
        console.log('开始执行OCR识别...');
        
        // 调用主进程打开文件选择器
        const result = await ipcRenderer.invoke('select-image-for-ocr');
        
        if (!result || result.canceled) {
            showToast('未选择图片');
            return;
        }
        
        currentFileName = result.fileName;
        
        // 使用Tesseract.js进行OCR识别
        const recognizedText = await performOCR(result.imageData);
        
        resultText.textContent = recognizedText || '未识别到文字';
        emptyState.style.display = 'none';
        resultSection.classList.add('active');
        showToast('OCR识别成功！');
        
    } catch (error) {
        console.error('OCR识别失败:', error);
        showToast('OCR识别失败：' + error.message);
        resultText.textContent = `OCR识别失败：${error.message}\n\n可能的原因：\n1. 网络连接问题，无法加载OCR引擎\n2. 图片格式不支持\n3. 图片质量问题\n\n建议：\n1. 检查网络连接\n2. 尝试使用其他图片\n3. 确保图片清晰可读`;
        emptyState.style.display = 'none';
        resultSection.classList.add('active');
    } finally {
        loading.classList.remove('active');
        recognizeBtn.disabled = false;
    }
});

// 复制按钮
copyBtn.addEventListener('click', () => {
    const text = resultText.textContent;
    if (text) {
        ipcRenderer.send('copy-to-clipboard', text);
        showToast('已复制到剪贴板！');
    }
});

// 保存按钮
saveBtn.addEventListener('click', async () => {
    const text = resultText.textContent;
    if (!text) return;
    
    const defaultName = currentFileName 
        ? currentFileName.replace(/\.[^/.]+$/, '') + '_ocr.txt'
        : 'ocr_result.txt';
    
    const result = await ipcRenderer.invoke('save-ocr-result', {
        defaultName: defaultName,
        content: text
    });
    
    if (result && !result.canceled) {
        showToast('保存成功！');
    }
});

console.log('OCR renderer loaded');
//created by AI//
