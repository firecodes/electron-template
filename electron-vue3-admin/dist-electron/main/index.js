import { release as f } from "node:os";
import { fileURLToPath as b } from "node:url";
import { dirname as w, join as s } from "node:path";
import { app as o, BrowserWindow as i, ipcMain as E, shell as _, Menu as a } from "electron";
const h = b(import.meta.url), c = w(h);
process.env.DIST_ELECTRON = s(c, "..");
process.env.DIST = s(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? s(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
const v = process.env.NODE_ENV === "development";
f().startsWith("6.1") && o.disableHardwareAcceleration();
process.platform === "win32" && o.setAppUserModelId(o.getName());
o.requestSingleInstanceLock() || (o.quit(), process.exit(0));
let e = null;
const p = s(c, "../preload/index.mjs"), d = process.env.VITE_DEV_SERVER_URL, m = s(process.env.DIST, "index.html");
function r(l = "进入全屏幕") {
  const n = a.buildFromTemplate(
    R(l)
  );
  a.setApplicationMenu(n);
}
async function u() {
  e = new i({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    title: "Main window",
    icon: s(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: p
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    }
  }), process.env.VITE_DEV_SERVER_URL ? e.loadURL(d) : e.loadFile(m), r(), e.webContents.on("did-finish-load", () => {
    e?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), e.webContents.setWindowOpenHandler(({ url: l }) => (l.startsWith("https:") && _.openExternal(l), { action: "deny" })), e.on("enter-full-screen", () => {
    r("退出全屏幕");
  }), e.on("leave-full-screen", () => {
    r();
  });
}
o.whenReady().then(u);
o.on("window-all-closed", () => {
  e = null, process.platform !== "darwin" && o.quit();
});
o.on("second-instance", () => {
  e && (e.isMinimized() && e.restore(), e.focus());
});
o.on("activate", () => {
  const l = i.getAllWindows();
  l.length ? l[0].focus() : u();
});
const R = (l) => {
  const n = [
    { label: "关于", role: "about" },
    { label: "开发者工具", role: "toggleDevTools" },
    { label: "强制刷新", role: "forcereload" },
    { label: "退出", role: "quit" }
  ];
  return v || n.splice(1, 1), [
    {
      label: o.name,
      submenu: n
    },
    {
      label: "编辑",
      submenu: [
        { label: "撤销", role: "undo" },
        {
          label: "重做",
          role: "redo"
        },
        { type: "separator" },
        { label: "剪切", role: "cut" },
        { label: "复制", role: "copy" },
        { label: "粘贴", role: "paste" },
        { label: "删除", role: "delete" },
        { label: "全选", role: "selectAll" }
      ]
    },
    {
      label: "显示",
      submenu: [
        { label: "加大", role: "zoomin" },
        {
          label: "默认大小",
          role: "resetzoom"
        },
        { label: "缩小", role: "zoomout" },
        { type: "separator" },
        {
          label: l,
          role: "togglefullscreen"
        }
      ]
    }
  ];
};
E.handle("open-win", (l, n) => {
  const t = new i({
    webPreferences: {
      preload: p,
      nodeIntegration: !0,
      contextIsolation: !1
    }
  });
  process.env.VITE_DEV_SERVER_URL ? t.loadURL(`${d}#${n}`) : t.loadFile(m, { hash: n });
});
