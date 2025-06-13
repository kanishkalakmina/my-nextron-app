import { app, screen, BrowserWindow, dialog } from 'electron'
import Store from 'electron-store'
const { autoUpdater, AppUpdater } = require('electron-updater')
import path from 'path'

Object.defineProperty(app, 'isPackaged', {
    get() {
        return true
    }
})

// Basic auto-updater setup
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true
    // autoUpdater.updateConfigPath = path.resolve(__dirname, '..', 'dev-app-update.yml')
let updateInProgress = false;


autoUpdater.checkForUpdatesAndNotify()


// Event listeners
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
})

// autoUpdater.on('update-available', (info) => {
//     console.log('Update available:', info)
// })
//
autoUpdater.on('update-not-available', () => {
    console.log('No updates available')
})

autoUpdater.on('error', (err) => {
    console.error('Update error:', err)
})

// **Prompt user when update is found**
autoUpdater.on('update-available', async(info) => {
    if (updateInProgress) {
        // Already downloading, skip showing dialog again
        console.log('Update already in progress, skipping prompt');
        return;
    }

    console.log('Update available:', info);
    const result = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Download Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update Available',
        message: `Version ${info.version} is available. Do you want to download it now?`,
    });

    if (result.response === 0) { // User clicked 'Update Now'
        updateInProgress = true; // <-- set flag here
        autoUpdater.downloadUpdate();
    }
});


autoUpdater.on('update-not-available', () => {
    console.log('No updates available')
})

autoUpdater.on('error', (err) => {
    console.error('Update error:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
    const log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent.toFixed(2)}%`
    console.log(log_message)
})

// After download completes, ask user if they want to install and restart now
autoUpdater.on('update-downloaded', async(info) => {
    updateInProgress = false; // Reset flag when download completes
    console.log('Update downloaded:', info)
    const result = await dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Would you like to quit and install it now?',
        buttons: ['Install Now', 'Later'],
        defaultId: 0,
        cancelId: 1
    })
    if (result.response === 0) {
        autoUpdater.quitAndInstall()
    }
})
autoUpdater.on('error', () => {
    updateInProgress = false; // Reset on error
});


export const createWindow = (windowName, options) => {
    const key = 'window-state'
    const name = `window-state-${windowName}`
    const store = new Store({ name })
    const defaultSize = {
        width: options.width,
        height: options.height,
    }
    let state = {}

    const restore = () => store.get(key, defaultSize)

    const getCurrentPosition = () => {
        const position = win.getPosition()
        const size = win.getSize()
        return {
            x: position[0],
            y: position[1],
            width: size[0],
            height: size[1],
        }
    }

    const windowWithinBounds = (windowState, bounds) => {
        return (
            windowState.x >= bounds.x &&
            windowState.y >= bounds.y &&
            windowState.x + windowState.width <= bounds.x + bounds.width &&
            windowState.y + windowState.height <= bounds.y + bounds.height
        )
    }

    const resetToDefaults = () => {
        const bounds = screen.getPrimaryDisplay().bounds
        return Object.assign({}, defaultSize, {
            x: (bounds.width - defaultSize.width) / 2,
            y: (bounds.height - defaultSize.height) / 2,
        })
    }

    const ensureVisibleOnSomeDisplay = (windowState) => {
        const visible = screen.getAllDisplays().some((display) => {
            return windowWithinBounds(windowState, display.bounds)
        })
        if (!visible) {
            // Window is partially or fully not visible now.
            // Reset it to safe defaults.
            return resetToDefaults()
        }
        return windowState
    }

    const saveState = () => {
        if (!win.isMinimized() && !win.isMaximized()) {
            Object.assign(state, getCurrentPosition())
        }
        store.set(key, state)
    }

    state = ensureVisibleOnSomeDisplay(restore())

    const win = new BrowserWindow({
        ...state,
        ...options,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            ...options.webPreferences,
        },
    })

    win.on('close', saveState)

    return win
}