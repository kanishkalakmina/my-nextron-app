import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { categoryHandlers, productHandlers, orderHandlers } from './ipc/handlers'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

const registerIpcHandlers = () => {
  // Categories
  ipcMain.handle('create-category', categoryHandlers.createCategory)
  ipcMain.handle('get-all-categories', categoryHandlers.getAllCategories)
  ipcMain.handle('get-category-by-id', categoryHandlers.getCategoryById)
  ipcMain.handle('update-category', categoryHandlers.updateCategory)
  ipcMain.handle('delete-category', categoryHandlers.deleteCategory)
  ipcMain.handle('search-categories', categoryHandlers.searchCategories)

  // Products
  ipcMain.handle('create-product', productHandlers.createProduct)
  ipcMain.handle('get-all-products', productHandlers.getAllProducts)
  ipcMain.handle('get-product-by-id', productHandlers.getProductById)
  ipcMain.handle('update-product', productHandlers.updateProduct)
  ipcMain.handle('delete-product', productHandlers.deleteProduct)
  ipcMain.handle('search-products', productHandlers.searchProducts)

  // Orders
  ipcMain.handle('create-order', orderHandlers.createOrder)
  ipcMain.handle('get-all-orders', orderHandlers.getAllOrders)
  ipcMain.handle('get-order-by-id', orderHandlers.getOrderById)
  ipcMain.handle('update-order-status', orderHandlers.updateOrderStatus)
  ipcMain.handle('search-orders', orderHandlers.searchOrders)
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  registerIpcHandlers()

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
