/**
 * HarmonyOS Electron - 多语言支持（i18n）模块
 *
 * 功能:
 * - 多语言资源管理
 * - 语言切换
 * - 翻译文本获取
 * - 语言包加载
 * - 自动语言检测
 * - 鸿蒙平台适配
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// 当前语言
let currentLanguage = 'zh-CN';

// 语言缓存
let translationsCache = {};

// 支持的语言列表
const supportedLanguages = [
    { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
    { code: 'en-US', name: 'English', nativeName: 'English' },
    { code: 'ja-JP', name: '日本語', nativeName: '日本語' },
    { code: 'ko-KR', name: '한국어', nativeName: '한국어' }
];

/**
 * 初始化 i18n 模块
 */
function initI18n() {
    // 检测系统语言
    const systemLanguage = detectSystemLanguage();

    // 设置当前语言
    setLanguage(systemLanguage);

    console.log('i18n 模块初始化完成，当前语言:', currentLanguage);
}

/**
 * 检测系统语言
 * @returns {string} 系统语言代码
 */
function detectSystemLanguage() {
    // 方法1: 从 app.getLocale() 获取
    try {
        const locale = app.getLocale();
        console.log('系统语言 (getLocale):', locale);

        // 检查是否支持该语言
        if (isLanguageSupported(locale)) {
            return locale;
        }

        // 尝试匹配语言代码的前两部分（如 zh-CN -> zh）
        const langCode = locale.split('-')[0];
        const matchedLang = supportedLanguages.find(lang => lang.code.startsWith(langCode));
        if (matchedLang) {
            return matchedLang.code;
        }
    } catch (error) {
        console.warn('无法通过 getLocale 获取系统语言:', error);
    }

    // 方法2: 从环境变量获取
    try {
        const envLang = process.env.LANG || process.env.LC_ALL || process.env.LANGUAGE;
        if (envLang) {
            console.log('系统语言 (环境变量):', envLang);
            const langCode = envLang.split('.')[0].replace('_', '-');
            if (isLanguageSupported(langCode)) {
                return langCode;
            }
        }
    } catch (error) {
        console.warn('无法通过环境变量获取系统语言:', error);
    }

    // 方法3: 使用默认语言
    console.log('使用默认语言: zh-CN');
    return 'zh-CN';
}

/**
 * 检查语言是否支持
 * @param {string} languageCode 语言代码
 * @returns {boolean} 是否支持
 */
function isLanguageSupported(languageCode) {
    return supportedLanguages.some(lang => lang.code === languageCode);
}

/**
 * 设置当前语言
 * @param {string} languageCode 语言代码
 * @returns {boolean} 是否成功设置
 */
function setLanguage(languageCode) {
    // 检查语言是否支持
    if (!isLanguageSupported(languageCode)) {
        console.warn(`不支持的语言: ${languageCode}`);
        return false;
    }

    // 更新当前语言
    currentLanguage = languageCode;

    // 清除缓存，重新加载翻译
    translationsCache = {};

    // 加载语言包
    loadLanguagePack(languageCode);

    console.log('语言已切换为:', languageCode);
    return true;
}

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * 获取支持的语言列表
 * @returns {Array} 语言列表
 */
function getSupportedLanguages() {
    return supportedLanguages;
}

/**
 * 加载语言包
 * @param {string} languageCode 语言代码
 */
function loadLanguagePack(languageCode) {
    try {
        // 尝试从文件加载
        const langFilePath = getLanguageFilePath(languageCode);
        if (fs.existsSync(langFilePath)) {
            const langData = fs.readFileSync(langFilePath, 'utf-8');
            translationsCache[languageCode] = JSON.parse(langData);
            console.log(`语言包加载成功: ${languageCode}`);
            return;
        }
    } catch (error) {
        console.warn(`无法从文件加载语言包 ${languageCode}:`, error);
    }

    // 使用内置的默认翻译
    translationsCache[languageCode] = getDefaultTranslations(languageCode);
    console.log(`使用内置翻译: ${languageCode}`);
}

/**
 * 获取语言文件路径
 * @param {string} languageCode 语言代码
 * @returns {string} 语言文件路径
 */
function getLanguageFilePath(languageCode) {
    // 尝试多个可能的路径
    const possiblePaths = [
        path.join(__dirname, 'locales', `${languageCode}.json`),
        path.join(__dirname, '..', 'locales', `${languageCode}.json`),
        path.join(__dirname, 'i18n', `${languageCode}.json`)
    ];

    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }

    return null;
}

/**
 * 获取默认翻译（内置翻译）
 * @param {string} languageCode 语言代码
 * @returns {Object} 翻译对象
 */
function getDefaultTranslations(languageCode) {
    const translations = {
        'zh-CN': {
            // 应用通用
            'app.name': 'HarmonyOS Electron',
            'app.version': '版本',

            // 菜单项
            'menu.file': '文件',
            'menu.edit': '编辑',
            'menu.view': '查看',
            'menu.help': '帮助',

            // 系统信息
            'system.title': '系统信息',
            'system.cpu': 'CPU',
            'system.memory': '内存',
            'system.os': '操作系统',
            'system.network': '网络',

            // 按钮
            'button.ok': '确定',
            'button.cancel': '取消',
            'button.save': '保存',
            'button.export': '导出',
            'button.close': '关闭',

            // 消息
            'message.loading': '加载中...',
            'message.success': '操作成功',
            'message.error': '操作失败',
            'message.confirm': '确认',

            // 设置
            'settings.language': '语言',
            'settings.theme': '主题',
            'settings.general': '通用'
        },
        'en-US': {
            // App General
            'app.name': 'HarmonyOS Electron',
            'app.version': 'Version',

            // Menu Items
            'menu.file': 'File',
            'menu.edit': 'Edit',
            'menu.view': 'View',
            'menu.help': 'Help',

            // System Info
            'system.title': 'System Information',
            'system.cpu': 'CPU',
            'system.memory': 'Memory',
            'system.os': 'Operating System',
            'system.network': 'Network',

            // Buttons
            'button.ok': 'OK',
            'button.cancel': 'Cancel',
            'button.save': 'Save',
            'button.export': 'Export',
            'button.close': 'Close',

            // Messages
            'message.loading': 'Loading...',
            'message.success': 'Success',
            'message.error': 'Error',
            'message.confirm': 'Confirm',

            // Settings
            'settings.language': 'Language',
            'settings.theme': 'Theme',
            'settings.general': 'General'
        },
        'ja-JP': {
            // アプリ共通
            'app.name': 'HarmonyOS Electron',
            'app.version': 'バージョン',

            // メニュー項目
            'menu.file': 'ファイル',
            'menu.edit': '編集',
            'menu.view': '表示',
            'menu.help': 'ヘルプ',

            // システム情報
            'system.title': 'システム情報',
            'system.cpu': 'CPU',
            'system.memory': 'メモリ',
            'system.os': 'オペレーティングシステム',
            'system.network': 'ネットワーク',

            // ボタン
            'button.ok': 'OK',
            'button.cancel': 'キャンセル',
            'button.save': '保存',
            'button.export': 'エクスポート',
            'button.close': '閉じる',

            // メッセージ
            'message.loading': '読み込み中...',
            'message.success': '成功',
            'message.error': 'エラー',
            'message.confirm': '確認',

            // 設定
            'settings.language': '言語',
            'settings.theme': 'テーマ',
            'settings.general': '一般'
        },
        'ko-KR': {
            // 앱 공통
            'app.name': 'HarmonyOS Electron',
            'app.version': '버전',

            // 메뉴 항목
            'menu.file': '파일',
            'menu.edit': '편집',
            'menu.view': '보기',
            'menu.help': '도움말',

            // 시스템 정보
            'system.title': '시스템 정보',
            'system.cpu': 'CPU',
            'system.memory': '메모리',
            'system.os': '운영체제',
            'system.network': '네트워크',

            // 버튼
            'button.ok': '확인',
            'button.cancel': '취소',
            'button.save': '저장',
            'button.export': '내보내기',
            'button.close': '닫기',

            // 메시지
            'message.loading': '로딩 중...',
            'message.success': '성공',
            'message.error': '오류',
            'message.confirm': '확인',

            // 설정
            'settings.language': '언어',
            'settings.theme': '테마',
            'settings.general': '일반'
        }
    };

    return translations[languageCode] || translations['zh-CN'];
}

/**
 * 获取翻译文本
 * @param {string} key 翻译键
 * @param {Object} params 参数对象（可选）
 * @returns {string} 翻译后的文本
 */
function t(key, params = {}) {
    // 获取当前语言的翻译
    const translations = translationsCache[currentLanguage];

    // 如果没有找到翻译，尝试使用默认语言
    if (!translations || !translations[key]) {
        console.warn(`翻译键未找到: ${key} (语言: ${currentLanguage})`);

        // 尝试使用简体中文作为后备
        const defaultTranslations = translationsCache['zh-CN'];
        if (defaultTranslations && defaultTranslations[key]) {
            return replaceParams(defaultTranslations[key], params);
        }

        // 如果都没有，返回键本身
        return replaceParams(key, params);
    }

    // 替换参数
    return replaceParams(translations[key], params);
}

/**
 * 替换翻译中的参数
 * @param {string} text 文本
 * @param {Object} params 参数对象
 * @returns {string} 替换后的文本
 */
function replaceParams(text, params) {
    if (!params || Object.keys(params).length === 0) {
        return text;
    }

    return text.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
    });
}

/**
 * 获取所有翻译键值对
 * @param {string} languageCode 语言代码（可选，默认当前语言）
 * @returns {Object} 翻译对象
 */
function getAllTranslations(languageCode = currentLanguage) {
    if (!translationsCache[languageCode]) {
        loadLanguagePack(languageCode);
    }
    return translationsCache[languageCode] || {};
}

/**
 * 创建语言选择菜单
 * @returns {Object} 菜单模板
 */
function createLanguageMenuTemplate() {
    return supportedLanguages.map(lang => ({
        label: lang.nativeName,
        type: 'radio',
        checked: currentLanguage === lang.code,
        click: () => {
            setLanguage(lang.code);
            // 通知渲染进程语言已更改
            if (global.mainWindow) {
                global.mainWindow.webContents.send('language-changed', lang.code);
            }
        }
    }));
}

/**
 * 导出翻译到文件
 * @param {string} languageCode 语言代码
 * @param {string} filePath 导出文件路径
 */
function exportTranslationsToFile(languageCode, filePath) {
    try {
        const translations = getAllTranslations(languageCode);
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf-8');
        console.log(`翻译已导出到: ${filePath}`);
        return true;
    } catch (error) {
        console.error('导出翻译失败:', error);
        return false;
    }
}

/**
 * 从文件导入翻译
 * @param {string} filePath 文件路径
 * @param {string} languageCode 语言代码
 */
function importTranslationsFromFile(filePath, languageCode) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const translations = JSON.parse(data);
        translationsCache[languageCode] = translations;
        console.log(`翻译已从文件导入: ${filePath}`);
        return true;
    } catch (error) {
        console.error('导入翻译失败:', error);
        return false;
    }
}

/**
 * 格式化数字（根据语言环境）
 * @param {number} number 数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber(number) {
    try {
        return new Intl.NumberFormat(currentLanguage).format(number);
    } catch (error) {
        console.warn('数字格式化失败:', error);
        return number.toString();
    }
}

/**
 * 格式化日期（根据语言环境）
 * @param {Date} date 日期
 * @param {Object} options 格式化选项
 * @returns {string} 格式化后的字符串
 */
function formatDate(date, options = {}) {
    try {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(date);
    } catch (error) {
        console.warn('日期格式化失败:', error);
        return date.toString();
    }
}

/**
 * 格式化货币（根据语言环境）
 * @param {number} amount 金额
 * @param {string} currency 货币代码
 * @returns {string} 格式化后的字符串
 */
function formatCurrency(amount, currency = 'CNY') {
    try {
        return new Intl.NumberFormat(currentLanguage, {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch (error) {
        console.warn('货币格式化失败:', error);
        return amount.toString();
    }
}

// 导出模块
module.exports = {
    initI18n,
    setLanguage,
    getCurrentLanguage,
    getSupportedLanguages,
    t,
    getAllTranslations,
    createLanguageMenuTemplate,
    exportTranslationsToFile,
    importTranslationsFromFile,
    formatNumber,
    formatDate,
    formatCurrency
};
