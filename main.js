const { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog, nativeTheme } = require("electron");
const path = require('path');
const fs = require('fs');
const { homedir } = require("os");
const KeyVault = require("./KeyVault");

if (require('electron-squirrel-startup')) app.quit();

let settings;
let vaults;
let mainWindow;
let editingWindow;
let mainWindowMenu;

let editingData = {};

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
    editingData.allKVs = vaults;
    mainWindowMenu = createMenu(win, vaults);

    win.loadFile('./pages/build/index.html')

    // win.webContents.openDevTools();

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
    // win.webContents.openDevTools();

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
        } catch (error) {
            dialog.showMessageBox(win, { message: 'Файл с хранилищами содержит недопустимое значение.', title: 'Ошибка' });
        }
    }

    editingData.allKVs = vaults;
    return vaults;
}

function saveVaults(win, newVaults) {
    const fileName = 'vaults-cfg.json';
    const filePath = path.join(__dirname, fileName);
    const fileExist = fs.existsSync(filePath);
    editingData.allKVs = newVaults;

    try {
        if (fileExist) {
            fs.unlinkSync(filePath);
        }

        fs.writeFileSync(filePath, JSON.stringify(newVaults));
    } catch (error) {
        dialog.showMessageBox(win, { message: 'Файл с хранилищами содержит недопустимое значение.', title: 'Ошибка' });
    }
}

function createMenu(win) {
    const menu = new Menu();

    const voltesMenuItem = new MenuItem({
        label: 'Хранилища',
        submenu: [{
            label: 'Выбрать',
            submenu: vaults.map(kv => ({
                label: kv.name || kv.kvName,
                type: 'radio',
                click: (item, window) => {
                    editingData.selectedKV = kv;

                    win.webContents.send('kv-selected', kv);
                }
            }))
        }, {
            type: 'separator'
        }, {
            label: 'Изменить',
            submenu: vaults.map(kv => ({
                label: kv.name || kv.kvName,
                type: 'normal',
                click: (item, window) => {
                    editingData.isNew = false;
                    editingData.selectedKV = kv;

                    createVaultEditWindow();
                    window.close();
                }
            }))
        }, {
            type: 'separator'
        }, {
            label: 'Удалить',
            submenu: vaults.map(kv => ({
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

                    if (!vaults.length) {
                        editingData.selectedKV = undefined;
                        editingData.secretNames = undefined;
                        win.webContents.send('kv-selected', undefined);
                    } else if (kv === editingData.selectedKV) {
                        editingData.selectedKV = vaults[0];
                        win.webContents.send('kv-selected', vaults[0]);
                    }

                    createMenu(win);
                }
            }))
        }, {
            type: 'separator'
        }, {
            label: 'Добавить',
            click: (item, window) => {
                editingData.isNew = true;
                editingData.selectedKV = {};

                createVaultEditWindow();
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
                            win.webContents.send('secret-function', 'subscription');
                        }
                    }, {
                        label: 'Profitbase',
                        click: (item, window) => {
                            win.webContents.send('secret-function', 'profitbase');
                        }
                    }, {
                        label: 'AmoCRM',
                        click: (item, window) => {
                            win.webContents.send('secret-function', 'amocrm');
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
                            exportSecrets(editingData.secretNames);
                        }
                    }, {
                        label: 'Выбранный',
                        click: (item, window) => {
                            if (editingData.selectedSecretName) {
                                exportSecrets([editingData.selectedSecretName]);
                            }
                        }
                    }
                ]
            }, {
                label: 'Импорт',
                click: (item, window) => {
                    console.log('Import');
                },
                enabled: false
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
    });

    menu.append(voltesMenuItem);
    menu.append(functionsMenuItem);
    menu.append(themeMenuItem);

    win.setMenu(menu);

    return menu;
}

async function exportSecrets(secretNames) {
    if (!editingData.selectedKV) return;

    const savePath = dialog.showSaveDialogSync(mainWindow ?? editingWindow, {
        defaultPath: path.resolve(homedir()),
        filters: [ { name: 'JSON', extensions: ['json'] }, { name: 'Text', extensions: ['txt'] } ]
    });

    if (!savePath) {
        return;
    }

    const data = {};
    const keyVault = new KeyVault(editingData.selectedKV);   

    for (let index = 0; index < secretNames.length; index++) {
        const secretName = secretNames[index];
        
        data[secretName] = await keyVault.getSecretContent(secretName);  
    }

    fs.writeFileSync(savePath, JSON.stringify(data));
}

app.whenReady().then(() => {
    createMainWindow();

    // Получение списка секретов в хранилище
    ipcMain.handle('fetch-secrets', async (ev, kv) => {
        try {
            mainWindowMenu.items.forEach(item => {
                item.submenu.items.forEach(itemSubmenu => {
                    itemSubmenu.enabled = false;
                })
            });
    
            editingData.selectedSecretName = undefined;
            
            const keyVault = new KeyVault(kv);   
            
            const names = await keyVault.getSecretNames();

            editingData.secretNames = names;
    
            mainWindowMenu.items.forEach(item => {
                item.submenu.items.forEach(itemSubmenu => {
                    itemSubmenu.enabled = true;
                })
            });
    
            return names;
        } catch (error) {
            dialog.showErrorBox('Ошибка', ['Не удалось запросить список секретов.', error.stack].join('\n\n'));

            mainWindowMenu.items.forEach(item => {
                item.submenu.items.forEach(itemSubmenu => {
                    itemSubmenu.enabled = true;
                })
            });

            return [];
        }
    });

    // Получение содержимого секрета
    ipcMain.handle('fetch-secret', async (ev, opts) => {
        try {
            mainWindowMenu.items.forEach(item => {
                item.submenu.items.forEach(itemSubmenu => {
                    itemSubmenu.enabled = false;
                })
            });
    
            const { secretName, kv } = opts;
    
            editingData.selectedSecretName = secretName;
            
            const keyVault = new KeyVault(kv);   
            
            const secretContent = await keyVault.getSecretContent(secretName);       
    
            mainWindowMenu.items.forEach(item => {
                item.submenu.items.forEach(itemSubmenu => {
                    itemSubmenu.enabled = true;
                })
            });

            return secretContent;
        } catch (error) {
            dialog.showErrorBox('Ошибка', ['Не удалось запросить содержимое секрета.', error.stack].join('\n\n'));

            mainWindowMenu.items.forEach(item => {
                item.submenu.items.forEach(itemSubmenu => {
                    itemSubmenu.enabled = true;
                })
            });

            return false;
        }
    });

    // Передача данных для окна создания\редактирования хранилищ
    ipcMain.handle('get-editing-data', () => {
        return editingData;
    });

    // Сохранение изменений в секрете
    ipcMain.handle('save-secret', async (ev, opts) => {
        const { kv, secretName, secretContent } = opts;
        
        try {
            const keyVault = new KeyVault(kv);   
            await keyVault.setSecretContent(secretName, secretContent);  

            return true;
        } catch (error) {
            dialog.showErrorBox('Ошибка', ['Не удалось изменить секрет.', error.stack].join('\n\n'));
            return false;
        }
    });

    // Удаление секрета
    ipcMain.handle('delete-secret', async (ev, opts) => {
        const { kv, secretName } = opts;

        try {
            const keyVault = new KeyVault(kv);   
            await keyVault.deleteSecret(secretName);  

            return true;
        } catch (error) {
            dialog.showErrorBox('Ошибка', ['Не удалось удалить секрет.', error.stack].join('\n\n'));
            return false;
        }
    });

    // Сохранение хранилища после редактирования
    ipcMain.on('save-kv', (ev, editedKVData) => {
        const indexOfEdited = vaults.indexOf(editingData.selectedKV);

        if (editedKVData.isNew || indexOfEdited === -1) {
            vaults.push(editedKVData.selectedKV);
        } else {
            vaults[indexOfEdited] = editedKVData.selectedKV;
        }
        saveVaults(editingWindow, vaults);

        editingWindow.close();
    });

    // Закрытие окна редактирования\создания
    ipcMain.on('cancel-editing', () => {
        editingWindow.close();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});