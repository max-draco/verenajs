/**
 * verenajs Desktop Generator
 * Generates desktop bundles for Electron and Qt
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Desktop Generator Class
 */
class DesktopGenerator {
  constructor(config) {
    this.config = config;
    this.useElectron = config.desktop?.electron !== false;
    this.useQt = config.desktop?.qt === true;
    this.platform = config.desktop?.platform || 'all';
  }

  /**
   * Generate desktop bundle
   */
  async generate(ast, analysis) {
    const outputs = [];

    if (this.useElectron) {
      // Generate Electron main process
      const main = this.generateElectronMain();
      outputs.push(main);

      // Generate preload script
      const preload = this.generatePreload();
      outputs.push(preload);

      // Generate Electron package config
      const packageConfig = this.generatePackageConfig();
      outputs.push(packageConfig);
    }

    if (this.useQt) {
      // Generate Qt main window
      const qtMain = this.generateQtMain();
      outputs.push(qtMain);

      // Generate Qt project file
      const qtProject = this.generateQtProject();
      outputs.push(qtProject);

      // Generate Qt CMake file
      const cmake = this.generateCMake();
      outputs.push(cmake);
    }

    // Generate renderer bundle
    const renderer = this.generateRenderer(ast, analysis);
    outputs.push(renderer);

    // Write outputs
    await this.writeOutputs(outputs);

    return {
      electron: this.useElectron,
      qt: this.useQt,
      size: outputs.reduce((sum, o) => sum + (o.code?.length || 0), 0)
    };
  }

  /**
   * Generate Electron main process
   */
  generateElectronMain() {
    const code = `
// verenajs Electron Main Process
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeTheme } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true
    },
    frame: ${this.config.desktop?.frame !== false},
    titleBarStyle: '${this.config.desktop?.titleBarStyle || 'default'}',
    backgroundColor: '#1e293b',
    show: false
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  // Create menu
  const menu = Menu.buildFromTemplate(getMenuTemplate());
  Menu.setApplicationMenu(menu);

  // Create tray if enabled
  ${this.config.desktop?.tray ? 'createTray();' : '// Tray disabled'}
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('dialog:openFile', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('dialog:saveFile', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('dialog:message', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('shell:openExternal', (event, url) => {
  return shell.openExternal(url);
});

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('theme:get', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

nativeTheme.on('updated', () => {
  mainWindow?.webContents.send('theme:changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
});

// Menu template
function getMenuTemplate() {
  return [
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new') },
        { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu:open') },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:save') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    }
  ];
}

// Tray
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));
  tray.setToolTip('verenajs App');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]));
  tray.on('click', () => mainWindow?.show());
}
`;

    return {
      name: 'electron-main',
      filename: 'main.js',
      code
    };
  }

  /**
   * Generate preload script
   */
  generatePreload() {
    const code = `
// verenajs Electron Preload Script
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialogs
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  showMessage: (options) => ipcRenderer.invoke('dialog:message', options),

  // App
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Window
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),

  // Theme
  getTheme: () => ipcRenderer.invoke('theme:get'),
  onThemeChange: (callback) => {
    ipcRenderer.on('theme:changed', (event, theme) => callback(theme));
  },

  // Menu events
  onMenuEvent: (event, callback) => {
    ipcRenderer.on('menu:' + event, callback);
  },

  // Platform info
  platform: process.platform,
  arch: process.arch,
  isPackaged: process.env.NODE_ENV === 'production'
});

// verenajs native bridge
contextBridge.exposeInMainWorld('__verena_desktop', {
  isElectron: true,
  platform: process.platform,

  // File system operations (through IPC)
  fs: {
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path, data) => ipcRenderer.invoke('fs:writeFile', path, data),
    exists: (path) => ipcRenderer.invoke('fs:exists', path)
  },

  // Clipboard
  clipboard: {
    read: () => ipcRenderer.invoke('clipboard:read'),
    write: (text) => ipcRenderer.invoke('clipboard:write', text)
  },

  // Notifications
  notify: (title, body, options) => {
    new Notification(title, { body, ...options });
  }
});
`;

    return {
      name: 'electron-preload',
      filename: 'preload.js',
      code
    };
  }

  /**
   * Generate Electron package config
   */
  generatePackageConfig() {
    const config = {
      name: this.config.appName?.toLowerCase().replace(/\s+/g, '-') || 'verenajs-app',
      productName: this.config.appName || 'verenajs App',
      version: this.config.version || '1.0.0',
      main: 'main.js',
      scripts: {
        start: 'electron .',
        dev: 'NODE_ENV=development electron .',
        build: 'electron-builder',
        'build:win': 'electron-builder --win',
        'build:mac': 'electron-builder --mac',
        'build:linux': 'electron-builder --linux'
      },
      build: {
        appId: this.config.appId || 'com.verenajs.app',
        productName: this.config.appName || 'verenajs App',
        directories: {
          output: 'release'
        },
        files: [
          'dist/**/*',
          'main.js',
          'preload.js',
          'assets/**/*'
        ],
        mac: {
          category: 'public.app-category.developer-tools',
          target: ['dmg', 'zip']
        },
        win: {
          target: ['nsis', 'portable']
        },
        linux: {
          target: ['AppImage', 'deb'],
          category: 'Development'
        }
      },
      dependencies: {
        electron: '^26.0.0'
      },
      devDependencies: {
        'electron-builder': '^24.0.0'
      }
    };

    return {
      name: 'electron-package',
      filename: 'package.json',
      code: JSON.stringify(config, null, 2)
    };
  }

  /**
   * Generate Qt main window
   */
  generateQtMain() {
    const code = `
// verenajs Qt Main Application
#include <QApplication>
#include <QWebEngineView>
#include <QWebChannel>
#include <QFile>
#include <QDir>
#include <QSystemTrayIcon>
#include <QMenu>
#include <QMessageBox>
#include "bridge.h"

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr) : QMainWindow(parent) {
        // Setup web view
        webView = new QWebEngineView(this);
        setCentralWidget(webView);

        // Setup web channel for JS-C++ communication
        channel = new QWebChannel(this);
        bridge = new VerenaBridge(this);
        channel->registerObject("backend", bridge);
        webView->page()->setWebChannel(channel);

        // Load the app
        QString htmlPath = QDir::currentPath() + "/dist/index.html";
        webView->setUrl(QUrl::fromLocalFile(htmlPath));

        // Window properties
        setWindowTitle("${this.config.appName || 'verenajs App'}");
        resize(1200, 800);
        setMinimumSize(800, 600);

        // Setup system tray
        setupTray();

        // Connect signals
        connect(bridge, &VerenaBridge::minimizeWindow, this, &MainWindow::showMinimized);
        connect(bridge, &VerenaBridge::maximizeWindow, this, &MainWindow::toggleMaximize);
        connect(bridge, &VerenaBridge::closeWindow, this, &MainWindow::close);
    }

private slots:
    void toggleMaximize() {
        if (isMaximized()) {
            showNormal();
        } else {
            showMaximized();
        }
    }

private:
    void setupTray() {
        trayIcon = new QSystemTrayIcon(this);
        trayIcon->setIcon(QIcon(":/icons/app.png"));

        QMenu *trayMenu = new QMenu(this);
        trayMenu->addAction("Show", this, &MainWindow::show);
        trayMenu->addSeparator();
        trayMenu->addAction("Quit", qApp, &QApplication::quit);

        trayIcon->setContextMenu(trayMenu);
        trayIcon->show();

        connect(trayIcon, &QSystemTrayIcon::activated, this, [this](QSystemTrayIcon::ActivationReason reason) {
            if (reason == QSystemTrayIcon::Trigger) {
                show();
                raise();
                activateWindow();
            }
        });
    }

    QWebEngineView *webView;
    QWebChannel *channel;
    VerenaBridge *bridge;
    QSystemTrayIcon *trayIcon;
};

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    app.setApplicationName("${this.config.appName || 'verenajs App'}");
    app.setOrganizationName("verenajs");

    MainWindow window;
    window.show();

    return app.exec();
}

#include "main.moc"
`;

    return {
      name: 'qt-main',
      filename: 'qt/main.cpp',
      code
    };
  }

  /**
   * Generate Qt project file
   */
  generateQtProject() {
    const code = `
QT += core gui widgets webenginewidgets webchannel

CONFIG += c++17

SOURCES += \\
    main.cpp \\
    bridge.cpp

HEADERS += \\
    bridge.h

RESOURCES += \\
    resources.qrc

# ZeroMQ integration
unix: LIBS += -lzmq
win32: LIBS += -L$$PWD/lib -lzmq

# OpenCV integration
unix: LIBS += -lopencv_core -lopencv_imgproc -lopencv_highgui
win32: LIBS += -L$$PWD/lib -lopencv_world

# Installation
target.path = /usr/local/bin
INSTALLS += target
`;

    return {
      name: 'qt-project',
      filename: 'qt/verenajs.pro',
      code
    };
  }

  /**
   * Generate CMake file
   */
  generateCMake() {
    const code = `
cmake_minimum_required(VERSION 3.16)
project(verenajs VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 REQUIRED COMPONENTS Core Gui Widgets WebEngineWidgets WebChannel)
find_package(OpenCV REQUIRED)
find_package(ZeroMQ REQUIRED)

add_executable(verenajs
    main.cpp
    bridge.cpp
    bridge.h
    resources.qrc
)

target_link_libraries(verenajs PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Widgets
    Qt6::WebEngineWidgets
    Qt6::WebChannel
    \${OpenCV_LIBS}
    \${ZeroMQ_LIBRARIES}
)

install(TARGETS verenajs
    RUNTIME DESTINATION bin
)
`;

    return {
      name: 'cmake',
      filename: 'qt/CMakeLists.txt',
      code
    };
  }

  /**
   * Generate renderer bundle
   */
  generateRenderer(ast, analysis) {
    const code = `
// verenajs Desktop Renderer
(function() {
  'use strict';

  // Desktop API abstraction
  window.__verena_desktop = window.__verena_desktop || window.electronAPI || {};

  // Platform detection
  var isElectron = typeof window.electronAPI !== 'undefined';
  var isQt = typeof window.qt !== 'undefined';

  window.__verena_desktop.isElectron = isElectron;
  window.__verena_desktop.isQt = isQt;
  window.__verena_desktop.isDesktop = isElectron || isQt;

  // Native window controls
  window.__verena_desktop.window = {
    minimize: function() {
      if (isElectron) return window.electronAPI.minimize();
      if (isQt) return window.qt.webChannelTransport.send({ type: 'minimize' });
    },
    maximize: function() {
      if (isElectron) return window.electronAPI.maximize();
      if (isQt) return window.qt.webChannelTransport.send({ type: 'maximize' });
    },
    close: function() {
      if (isElectron) return window.electronAPI.close();
      if (isQt) return window.qt.webChannelTransport.send({ type: 'close' });
    },
    setTitle: function(title) {
      document.title = title;
      if (isQt) window.qt.webChannelTransport.send({ type: 'setTitle', title: title });
    }
  };

  // Native theme
  window.__verena_desktop.theme = {
    get: function() {
      if (isElectron) return window.electronAPI.getTheme();
      if (isQt) return window.qt.webChannelTransport.send({ type: 'getTheme' });
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    onChange: function(callback) {
      if (isElectron) {
        window.electronAPI.onThemeChange(callback);
      } else {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
          callback(e.matches ? 'dark' : 'light');
        });
      }
    }
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Prevent browser defaults for desktop app shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'r': // Prevent refresh in production
          if (!window.__verena_desktop.isDev) e.preventDefault();
          break;
        case 'w': // Close window
          e.preventDefault();
          window.__verena_desktop.window.close();
          break;
        case 'm': // Minimize
          e.preventDefault();
          window.__verena_desktop.window.minimize();
          break;
      }
    }
  });

})();
`;

    return {
      name: 'desktop-renderer',
      filename: 'renderer.js',
      code
    };
  }

  /**
   * Write outputs to disk
   */
  async writeOutputs(outputs) {
    const outDir = path.join(this.config.output.dir, 'desktop');

    await fs.promises.mkdir(outDir, { recursive: true });

    for (const output of outputs) {
      const filePath = path.join(outDir, output.filename);
      const dir = path.dirname(filePath);

      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(filePath, output.code);
    }
  }
}

export { DesktopGenerator };
export default DesktopGenerator;
