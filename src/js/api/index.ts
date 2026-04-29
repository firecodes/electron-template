/**
 * MusicBox API
 * 统一的 API 导出接口
 */


// api.js 过于庞大，暂不迁移到TypeScript


// 导出 API 实例
import {
    fileAPI,
    userDataAPI,
    trayAPI,
    windowAPI,
    libraryAPI,
    networkAPI,
    lyricsAPI,
    coverAPI,
    updateAPI
} from '@api/modules';

export {
    fileAPI,
    userDataAPI,
    trayAPI,
    windowAPI,
    libraryAPI,
    networkAPI,
    lyricsAPI,
    coverAPI,
    updateAPI
};

export const MusicBoxAPI = {
    file: fileAPI,
    userdata: userDataAPI,
    tray: trayAPI,
    window: windowAPI,
    library: libraryAPI,
    network: networkAPI,
    lyrics: lyricsAPI,
    cover: coverAPI,
    update: updateAPI
} as const;

export default MusicBoxAPI;
