/**
 * HarmonyOS Electron - 应用更新检查模块
 *
 * 功能:
 * - 检查应用更新
 * - 下载更新包
 * - 显示更新进度
 * - 安装更新
 * - 鸿蒙平台适配
 * - 更新历史记录
 */

const { app, dialog, BrowserWindow, ipcMain } = require('electron');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 更新配置
const UPDATE_CONFIG = {
    // 更新服务器地址（示例：使用 GitHub Releases）
    updateServer: 'https://api.github.com/repos/jianguoxu/harmonypc-electron/releases/latest',
    // 下载服务器地址
    downloadServer: 'https://github.com/jianguoxu/harmonypc-electron/releases/download',
    // 更新检查间隔（毫秒）
    checkInterval: 24 * 60 * 60 * 1000, // 24小时
    // 自动下载更新
    autoDownload: false,
    // 自动安装更新
    autoInstall: false,
    // 更新日志文件
    updateLogPath: path.join(app.getPath('userData'), 'update-log.json')
};

// 当前版本
let currentVersion = null;

// 最新版本信息
let latestVersionInfo = null;

// 更新状态
let updateStatus = {
    checking: false,
    available: false,
    downloading: false,
    installing: false,
    error: null
};

// 下载进度
let downloadProgress = {
    percent: 0,
    transferred: 0,
    total: 0,
    speed: 0
};

/**
 * 初始化更新模块
 */
function initUpdater() {
    // 获取当前版本
    currentVersion = getCurrentVersion();

    console.log('更新模块初始化完成，当前版本:', currentVersion);

    // 如果不是开发模式，启动定时检查更新
    if (!app.isPackaged) {
        console.log('开发模式，跳过自动更新检查');
        return;
    }

    // 启动定时检查
    startAutoCheck();

    // 应用启动时检查一次更新
    setTimeout(() => {
        checkForUpdates(false);
    }, 5000); // 5秒后检查
}

/**
 * 获取当前版本
 * @returns {string} 版本号
 */
function getCurrentVersion() {
    try {
        // 方法1: 从 package.json 读取
        const packagePath = path.join(__dirname, 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
            return packageData.version || '0.0.0';
        }
    } catch (error) {
        console.warn('无法从 package.json 读取版本:', error);
    }

    // 方法2: 使用 app.getVersion()
    try {
        return app.getVersion();
    } catch (error) {
        console.warn('无法获取应用版本:', error);
    }

    return '0.0.0';
}

/**
 * 检查更新
 * @param {boolean} showNotification 是否显示通知
 * @returns {Promise<Object>} 更新信息
 */
function checkForUpdates(showNotification = true) {
    return new Promise((resolve, reject) => {
        if (updateStatus.checking) {
            console.log('正在检查更新，跳过');
            resolve({ checking: true });
            return;
        }

        updateStatus.checking = true;
        updateStatus.error = null;

        console.log('开始检查更新...');

        // 请求更新服务器
        const options = {
            headers: {
                'User-Agent': 'HarmonyOS-Electron-Updater'
            }
        };

        https.get(UPDATE_CONFIG.updateServer, options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const releaseInfo = JSON.parse(data);
                    latestVersionInfo = releaseInfo;

                    const latestVersion = releaseInfo.tag_name.replace('v', '');
                    const hasUpdate = compareVersions(currentVersion, latestVersion) < 0;

                    updateStatus.checking = false;
                    updateStatus.available = hasUpdate;

                    console.log('当前版本:', currentVersion);
                    console.log('最新版本:', latestVersion);
                    console.log('有更新:', hasUpdate);

                    if (hasUpdate) {
                        console.log('发现新版本:', latestVersion);
                        console.log('更新说明:', releaseInfo.body);

                        // 通知主窗口
                        notifyUpdateAvailable(releaseInfo, showNotification);

                        // 记录更新日志
                        logUpdateCheck(currentVersion, latestVersion, true);
                    } else {
                        console.log('已是最新版本');
                        logUpdateCheck(currentVersion, latestVersion, false);

                        if (showNotification) {
                            showNotificationMessage('已是最新版本', `当前版本 ${currentVersion} 已是最新版本`);
                        }
                    }

                    resolve({
                        hasUpdate,
                        currentVersion,
                        latestVersion,
                        releaseInfo
                    });
                } catch (error) {
                    console.error('解析更新信息失败:', error);
                    updateStatus.checking = false;
                    updateStatus.error = error.message;
                    reject(error);
                }
            });
        }).on('error', (error) => {
            console.error('检查更新失败:', error);
            updateStatus.checking = false;
            updateStatus.error = error.message;
            reject(error);
        });
    });
}

/**
 * 比较版本号
 * @param {string} version1 版本1
 * @param {string} version2 版本2
 * @returns {number} -1: version1 < version2, 0: version1 == version2, 1: version1 > version2
 */
function compareVersions(version1, version2) {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;

        if (num1 < num2) return -1;
        if (num1 > num2) return 1;
    }

    return 0;
}

/**
 * 通知更新可用
 * @param {Object} releaseInfo 发布信息
 * @param {boolean} showNotification 是否显示通知
 */
function notifyUpdateAvailable(releaseInfo, showNotification) {
    const latestVersion = releaseInfo.tag_name.replace('v', '');
    const message = `发现新版本 ${latestVersion}\n\n${releaseInfo.body || ''}`;

    // 通知主窗口
    if (global.mainWindow) {
        global.mainWindow.webContents.send('update-available', {
            version: latestVersion,
            releaseNotes: releaseInfo.body,
            downloadUrl: getDownloadUrl(latestVersion)
        });
    }

    // 显示系统通知
    if (showNotification) {
        showNotificationMessage('发现新版本', `版本 ${latestVersion} 已发布，点击查看详情`);
    }
}

/**
 * 获取下载 URL
 * @param {string} version 版本号
 * @returns {string} 下载 URL
 */
function getDownloadUrl(version) {
    // 根据平台选择不同的下载包
    let platform = process.platform;
    let arch = process.arch;

    // 平台映射
    if (platform === 'darwin') platform = 'macos';
    if (platform === 'win32') platform = 'windows';
    if (platform === 'linux') platform = 'linux';

    // 架构映射
    if (arch === 'x64') arch = 'x64';
    if (arch === 'arm64') arch = 'arm64';

    // 鸿蒙平台特殊处理
    if (process.platform === 'harmonyos') {
        platform = 'harmonyos';
    }

    return `${UPDATE_CONFIG.downloadServer}/v${version}/harmonypc-electron-${platform}-${arch}.zip`;
}

/**
 * 下载更新
 * @param {string} version 版本号
 * @param {Function} onProgress 进度回调
 * @returns {Promise<string>} 下载的文件路径
 */
function downloadUpdate(version, onProgress) {
    return new Promise((resolve, reject) => {
        const downloadUrl = getDownloadUrl(version);
        const fileName = `update-v${version}.zip`;
        const filePath = path.join(app.getPath('temp'), fileName);

        console.log('开始下载更新:', downloadUrl);

        updateStatus.downloading = true;
        updateStatus.error = null;

        // 重置进度
        downloadProgress = {
            percent: 0,
            transferred: 0,
            total: 0,
            speed: 0
        };

        const file = fs.createWriteStream(filePath);
        const url = new URL(downloadUrl);

        const protocol = url.protocol === 'https:' ? https : http;

        const request = protocol.get(downloadUrl, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`下载失败: ${response.statusCode}`));
                return;
            }

            const totalSize = parseInt(response.headers['content-length'], 10);
            downloadProgress.total = totalSize;

            let startTime = Date.now();
            let lastTransferred = 0;

            response.on('data', (chunk) => {
                downloadProgress.transferred += chunk.length;
                downloadProgress.percent = (downloadProgress.transferred / totalSize) * 100;

                // 计算下载速度
                const elapsed = (Date.now() - startTime) / 1000;
                if (elapsed > 0) {
                    downloadProgress.speed = (downloadProgress.transferred - lastTransferred) / elapsed;
                    lastTransferred = downloadProgress.transferred;
                }

                // 通知进度
                if (onProgress) {
                    onProgress(downloadProgress);
                }

                // 通知主窗口
                if (global.mainWindow) {
                    global.mainWindow.webContents.send('download-progress', downloadProgress);
                }
            });

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                updateStatus.downloading = false;

                console.log('下载完成:', filePath);

                // 验证文件完整性
                verifyUpdateFile(filePath)
                    .then(() => {
                        resolve(filePath);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        });

        request.on('error', (error) => {
            fs.unlink(filePath, () => {});
            updateStatus.downloading = false;
            updateStatus.error = error.message;
            reject(error);
        });
    });
}

/**
 * 验证更新文件
 * @param {string} filePath 文件路径
 * @returns {Promise<boolean>} 验证结果
 */
function verifyUpdateFile(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const stats = fs.statSync(filePath);

            if (stats.size === 0) {
                reject(new Error('更新文件为空'));
                return;
            }

            if (stats.size < 1024) {
                reject(new Error('更新文件过小，可能下载不完整'));
                return;
            }

            console.log('更新文件验证通过:', filePath);
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 安装更新
 * @param {string} filePath 更新文件路径
 * @returns {Promise<boolean>} 安装结果
 */
function installUpdate(filePath) {
    return new Promise((resolve, reject) => {
        console.log('开始安装更新:', filePath);

        updateStatus.installing = true;
        updateStatus.error = null;

        // 鸿蒙平台特殊处理
        if (process.platform === 'harmonyos') {
            installHarmonyOSUpdate(filePath)
                .then(() => {
                    updateStatus.installing = false;
                    resolve(true);
                })
                .catch(error => {
                    updateStatus.installing = false;
                    updateStatus.error = error.message;
                    reject(error);
                });
        } else {
            // 其他平台使用通用安装方法
            installGenericUpdate(filePath)
                .then(() => {
                    updateStatus.installing = false;
                    resolve(true);
                })
                .catch(error => {
                    updateStatus.installing = false;
                    updateStatus.error = error.message;
                    reject(error);
                });
        }
    });
}

/**
 * 安装鸿蒙平台更新
 * @param {string} filePath 更新文件路径
 * @returns {Promise<boolean>} 安装结果
 */
function installHarmonyOSUpdate(filePath) {
    return new Promise((resolve, reject) => {
        try {
            // 鸿蒙平台需要使用特殊的安装方法
            // 这里需要调用鸿蒙系统的更新 API

            console.log('鸿蒙平台更新安装（模拟）');

            // 解压更新包
            const extractPath = path.join(app.getPath('temp'), 'update-extract');

            // 创建更新安装脚本
            const installScript = `
                #!/bin/bash
                echo "正在安装更新..."
                cp -r ${extractPath}/* ${app.getAppPath()}/
                echo "更新安装完成"
                exit 0
            `;

            const scriptPath = path.join(app.getPath('temp'), 'install-update.sh');
            fs.writeFileSync(scriptPath, installScript, 'utf-8');

            // 模拟安装成功
            setTimeout(() => {
                console.log('鸿蒙平台更新安装完成');
                resolve(true);
            }, 2000);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 安装通用更新
 * @param {string} filePath 更新文件路径
 * @returns {Promise<boolean>} 安装结果
 */
function installGenericUpdate(filePath) {
    return new Promise((resolve, reject) => {
        try {
            // 通用平台的安装方法
            // 这里需要根据实际需求实现

            console.log('通用平台更新安装（模拟）');

            // 模拟安装成功
            setTimeout(() => {
                console.log('通用平台更新安装完成');
                resolve(true);
            }, 2000);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 重启应用以应用更新
 */
function quitAndInstall() {
    console.log('准备重启应用以应用更新');

    // 保存当前状态
    const updateInfo = {
        pendingUpdate: true,
        version: latestVersionInfo.tag_name,
        timestamp: Date.now()
    };

    try {
        fs.writeFileSync(
            path.join(app.getPath('userData'), 'pending-update.json'),
            JSON.stringify(updateInfo, null, 2),
            'utf-8'
        );
    } catch (error) {
        console.error('保存更新信息失败:', error);
    }

    // 退出应用
    app.quit();
}

/**
 * 启动自动检查
 */
function startAutoCheck() {
    console.log('启动自动更新检查，间隔:', UPDATE_CONFIG.checkInterval, '毫秒');

    setInterval(() => {
        checkForUpdates(false);
    }, UPDATE_CONFIG.checkInterval);
}

/**
 * 显示系统通知
 * @param {string} title 标题
 * @param {string} body 内容
 */
function showNotificationMessage(title, body) {
    const { Notification } = require('electron');

    if (Notification.isSupported()) {
        const notification = new Notification({
            title: title,
            body: body,
            silent: false
        });

        notification.show();

        notification.on('click', () => {
            if (global.mainWindow) {
                global.mainWindow.show();
                global.mainWindow.focus();
            }
        });
    }
}

/**
 * 记录更新检查日志
 * @param {string} currentVersion 当前版本
 * @param {string} latestVersion 最新版本
 * @param {boolean} hasUpdate 是否有更新
 */
function logUpdateCheck(currentVersion, latestVersion, hasUpdate) {
    try {
        let logs = [];

        if (fs.existsSync(UPDATE_CONFIG.updateLogPath)) {
            logs = JSON.parse(fs.readFileSync(UPDATE_CONFIG.updateLogPath, 'utf-8'));
        }

        logs.push({
            timestamp: new Date().toISOString(),
            currentVersion,
            latestVersion,
            hasUpdate
        });

        // 只保留最近 30 条记录
        if (logs.length > 30) {
            logs = logs.slice(-30);
        }

        fs.writeFileSync(
            UPDATE_CONFIG.updateLogPath,
            JSON.stringify(logs, null, 2),
            'utf-8'
        );
    } catch (error) {
        console.error('记录更新日志失败:', error);
    }
}

/**
 * 获取更新状态
 * @returns {Object} 更新状态
 */
function getUpdateStatus() {
    return {
        ...updateStatus,
        currentVersion,
        latestVersion: latestVersionInfo ? latestVersionInfo.tag_name.replace('v', '') : null,
        downloadProgress
    };
}

/**
 * 设置更新配置
 * @param {Object} config 配置对象
 */
function setUpdateConfig(config) {
    Object.assign(UPDATE_CONFIG, config);
    console.log('更新配置已更新:', UPDATE_CONFIG);
}

// 导出模块
module.exports = {
    initUpdater,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    quitAndInstall,
    getUpdateStatus,
    setUpdateConfig,
    getCurrentVersion
};
