import path from "path";
import { app, ipcMain, dialog, protocol } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import {
  categoryHandlers,
  productHandlers,
  orderHandlers,
  userHandlers,
} from "./ipc/handlers";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
  
  // Register protocol for serving images from AppData
  app.whenReady().then(() => {
    protocol.registerFileProtocol('upload', (request, callback) => {
      const appDataPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
      const url = request.url.replace('upload://', '');
      const filePath = path.join(appDataPath, 'my-nextron-app', 'uploads', path.basename(url));
      callback({ path: filePath });
    });
  });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

const registerIpcHandlers = () => {
  // Categories
  ipcMain.handle("create-category", categoryHandlers.createCategory);
  ipcMain.handle("get-all-categories", categoryHandlers.getAllCategories);
  ipcMain.handle("get-category-by-id", categoryHandlers.getCategoryById);
  ipcMain.handle("update-category", categoryHandlers.updateCategory);
  ipcMain.handle("delete-category", categoryHandlers.deleteCategory);
  ipcMain.handle("search-categories", categoryHandlers.searchCategories);

  // Products
  ipcMain.handle("upload-image", productHandlers.uploadImage);
  ipcMain.handle("create-product", productHandlers.createProduct);
  ipcMain.handle("get-all-products", productHandlers.getAllProducts);
  ipcMain.handle("get-product-by-id", productHandlers.getProductById);
  ipcMain.handle("update-product", productHandlers.updateProduct);
  ipcMain.handle("delete-product", productHandlers.deleteProduct);
  ipcMain.handle("search-products", productHandlers.searchProducts);

  // Orders
  ipcMain.handle("create-order", orderHandlers.createOrder);
  ipcMain.handle("get-all-orders", orderHandlers.getAllOrders);
  ipcMain.handle("get-order-by-id", orderHandlers.getOrderById);
  ipcMain.handle("update-order-status", orderHandlers.updateOrderStatus);
  ipcMain.handle("search-orders", orderHandlers.searchOrders);

  // User management
  ipcMain.handle('createUser', userHandlers.createUser);
  ipcMain.handle('getAllUsers', userHandlers.getAllUsers);
  ipcMain.handle('updateUser', userHandlers.updateUser);
  ipcMain.handle('deleteUser', userHandlers.deleteUser);
  ipcMain.handle('resetUserPassword', userHandlers.resetUserPassword);
};

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  registerIpcHandlers();

  if (isProd) {
    await mainWindow.loadURL("app://./dashboard");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/dashboard`);
    // mainWindow.webContents.openDevTools()
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});
