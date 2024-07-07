import { app, BrowserWindow } from 'electron';
import path from 'path';
import electronSquirrelStartup from 'electron-squirrel-startup';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import pkg from 'electron-updater';
const { autoUpdater } = pkg


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
    app.quit();
}

// Configure update server URL
const server = 'http://localhost:8080';
autoUpdater.setFeedURL({
    provider: 'generic',
    url: `${server}/updates/update.yml`
});

autoUpdater.allowPrerelease = true; 
// Function to check for updates and notify user
function checkForUpdates() {
    // Check for updates
    autoUpdater.checkForUpdates()
        .then(updateCheckResult => {
            if (updateCheckResult && updateCheckResult.downloadPromise) {
                // Update available, begin downloading
                console.log('Update available, downloading...');
                updateCheckResult.downloadPromise.then(() => {
                    // Download complete, notify user and install
                    console.log('Update downloaded, will install now');
                    autoUpdater.quitAndInstall();
                });
            } else {
                // No update available
                console.log('No update available');
            }
        })
        .catch(err => {
            // Error handling
            console.error('Error checking for updates:', err);
        });
}


const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // Load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// Create window and check for updates when Electron is ready.
app.whenReady().then(() => {
    createWindow();
    checkForUpdates();

    // On macOS, recreate a window when the dock icon is clicked and no other windows are open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Auto-update events
autoUpdater.on('update-available', () => {
    console.log('Update available');
});
autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    // Optionally: Prompt the user to install the update
    autoUpdater.quitAndInstall();
});
autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err.message);
});
