const { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog, nativeTheme } = require("electron");
const path = require('path');
const fs = require('fs');
const { globalParams } = require("./global-params");

if (require('electron-squirrel-startup')) app.quit();

let settings;
let vaults;
let mainWindow;
let editingWindow;
let mainWindowMenu;

let selectedKV;

function createMainWindow() {
    settings = getSettings();
    const win = new BrowserWindow({
        ...settings,
        minWidth: 650,
        minHeight: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload-main.js')
        },
    });
    vaults = getVaults(win);
    mainWindowMenu = createMenu(win, vaults);


    win.loadFile('./pages/build/index.html').then(() => {
        win.webContents.send('kv-selected', vaults[0]);
    });
    
    win.webContents.openDevTools();

    win.on('close', () => {
        const winSize = win.getSize();

        settings.width = winSize[0];
        settings.height = winSize[1];

        saveSettings(win, settings);
    });

    mainWindow = win;
}

function createVaultEditWindow() {
    const win = new BrowserWindow({
        height: 600,
        width: 750,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload-create.js')
        },
    });
    win.removeMenu();

    win.loadFile('./pages/build/create.html').then(() => {
        win.webContents.send('kv-selected', vaults[0]);
    });

    editingWindow = win;

    win.on('close', () => {
        createMainWindow();
    });
}

/**
 * Получение настроек приложения 
 */
function getSettings() {
    const fileName = 'app-settings.json';
    const filePath = path.join(__dirname, fileName);
    const fileExist = fs.existsSync(filePath);
    
    let settings = { width: 700, height: 500 };

    if (!fileExist) {
        fs.appendFileSync(filePath, JSON.stringify(settings));
        return settings;
    } else {
        try {
            const fileData = JSON.parse(fs.readFileSync(filePath));

            settings = fileData;

            return settings;
        } catch (error) {
            return settings;
        }
    }
}

/**
 * Сохранение настроек приложения
 */
function saveSettings(win, newSettings) {
    const fileName = 'app-settings.json';
    const filePath = path.join(__dirname, fileName);
    const fileExist = fs.existsSync(filePath);

    try {
        if (fileExist) {
            fs.unlinkSync(filePath);
        }

        fs.writeFileSync(filePath, JSON.stringify(newSettings));
    } catch (error) {
        dialog.showMessageBox(win, { message: 'Файл конфигурации содержит недопустимое значение.', title: 'Ошибка' });
    }
}

function getVaults(win) {
    const fileName = 'vaults-cfg.json';
    const filePath = path.join(__dirname, fileName);
    const fileExist = fs.existsSync(filePath);
    
    let vaults = [];

    if (!fileExist) {
        fs.appendFileSync(filePath, '[]');
        return vaults;
    } else {
        try {
            const fileData = JSON.parse(fs.readFileSync(filePath));

            const haveWrongParams = fileData.some((item) => {
                const keys = Object.getOwnPropertyNames(item);

                return !keys.includes('name') || !keys.includes('kvName') || !keys.includes('aci') || !keys.includes('acs') || !keys.includes('ati');
            });

            if (haveWrongParams) {
                throw new Error('Не все хранилища заполнены верно.');
            }

            vaults = fileData;

            return vaults;
        } catch (error) {
            dialog.showMessageBox(win, { message: 'Файл с хранилищами содержит недопустимое значение.', title: 'Ошибка' });
            return vaults;
        }
    }
}

function saveVaults(win, newVaults) {
    const fileName = 'vaults-cfg.json';
    const filePath = path.join(__dirname, fileName);
    const fileExist = fs.existsSync(filePath);

    try {
        if (fileExist) {
            fs.unlinkSync(filePath);
        }

        fs.writeFileSync(filePath, JSON.stringify(newVaults));
    } catch (error) {
        dialog.showMessageBox(win, { message: 'Файл с хранилищами содержит недопустимое значение.', title: 'Ошибка' });
    }
}

function createMenu(win, settings) {
    const menu = new Menu();

    const voltesMenuItem = new MenuItem({
        label: 'Хранилища',
        submenu: [{
            label: 'Выбрать',
            submenu: settings.map(kv => ({
                label: kv.name || kv.kvName,
                type: 'radio',
                click: (item, window) => {
                    win.webContents.send('kv-selected', kv);
                }
            }))
        }, {
            type: 'separator'
        }, {
            label: 'Изменить',
            submenu: settings.map(kv => ({
                label: kv.name || kv.kvName,
                type: 'normal',
                click: (item, window) => {
                    createVaultEditWindow();
                    
                    globalParams.selectedKV = kv;
                    globalParams.isEditingNew = false;
                    
                    window.close();
                }
            }))
        }, {
            type: 'separator'
        }, {
            label: 'Удалить',
            submenu: settings.map(kv => ({
                label: kv.name || kv.kvName,
                type: 'normal',
                click: (item, window) => {
                    const result = dialog.showMessageBoxSync(window, {
                        title: 'Удаление',
                        message: `Удалить хранилище ${kv.name || kv.kvName} из списка сохранённых?`,
                        buttons: [
                            'Да',
                            'Отмена'
                        ],
                        cancelId: 1,
                        
                    });

                    if (result === 1) return;

                    vaults = vaults.filter(vault => vault !== kv);

                    saveVaults(window, vaults);

                    app.relaunch();
                    window.close();
                }
            }))
        }, {
            type: 'separator'
        }, {
            label: 'Добавить',
            click: (item, window) => {
                createVaultEditWindow();
                globalParams.selectedKV = {};
                globalParams.isEditingNew = true;
                
                window.close();
            }
        }]
    });

    const functionsMenuItem = new MenuItem({
        label: 'Функции',
        submenu: [
            {
                label: 'Добавить JSON',
                submenu: [
                    {
                        label: 'Подписка',
                        click: (item, window) => {
                            console.log('Add Subs');
                        }
                    }, {
                        label: 'Profitbase',
                        click: (item, window) => {
                            console.log('Add Profitbase');
                        }
                    }, {
                        label: 'AmoCRM',
                        click: (item, window) => {
                            console.log('Add AmoCRM');
                        }
                    }
                ]
            }, {
                label: 'Форматировать',
                accelerator: 'CommandOrControl+Shift+F',
                click: (item, window) => window.webContents.send('format')
            }, {
                label: 'Экспорт',
                submenu: [
                    {
                        label: 'Все',
                        click: (item, window) => {
                            console.log('Export All');
                        }
                    }, {
                        label: 'Выбранный',
                        click: (item, window) => {
                            console.log('Export Selected');
                        }
                    }
                ]
            }, {
                label: 'Импорт',
                click: (item, window) => {
                    console.log('Import');
                }
            }
        ]
    });

    const themeMenuItem = new MenuItem({
        label: 'Тема',
        submenu: [
            {
                label: 'Светлая',
                type: 'radio',
                click: (item, window) => window.webContents.send('theme-change', 'light'),
                checked: !nativeTheme.shouldUseDarkColors
            }, {
                label: 'Тёмная',
                type: 'radio',
                click: (item, window) => window.webContents.send('theme-change', 'dark'),
                checked: nativeTheme.shouldUseDarkColors
            }
        ]
    })

    menu.append(voltesMenuItem);
    menu.append(functionsMenuItem);
    menu.append(themeMenuItem);

    win.setMenu(menu);

    return menu;
}

app.whenReady().then(() => {
    createMainWindow();
    
    // Получение списка секретов в хранилище
    ipcMain.handle('fetch-secrets', async (kv) => {
        mainWindowMenu.items.forEach(item => {
            item.submenu.items.forEach(itemSubmenu => {
                itemSubmenu.enabled = false;
            })
        });
        

        // await new Promise(res => setTimeout(res, 2000));

        mainWindowMenu.items.forEach(item => {
            item.submenu.items.forEach(itemSubmenu => {
                itemSubmenu.enabled = true;
            })
        });

        return ['test 123'];
    });

    // Получение содержимого секрета
    ipcMain.handle('fetch-secret', async (opts) => {
        mainWindowMenu.items.forEach(item => {
            item.submenu.items.forEach(itemSubmenu => {
                itemSubmenu.enabled = false;
            })
        });

        const { secretName, kv } = opts;
        // await new Promise(res => setTimeout(res, 2000));

        mainWindowMenu.items.forEach(item => {
            item.submenu.items.forEach(itemSubmenu => {
                itemSubmenu.enabled = true;
            })
        });
        return JSON.stringify(opts);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});