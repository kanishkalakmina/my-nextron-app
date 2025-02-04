import {
    categoryQueries,
    productQueries,
    orderQueries,
    userQueries,
    roleQueries,
    holdOrderQueries,
    paymentQueries,
    invoicedItemQueries,
    billTemplateQueries,
    stockQueries,
} from "../db/index.js";
import {
    app
} from "electron";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

// Function to generate UUID
const generateUUID = () => {
    return crypto.randomUUID();
};

const getUploadDir = () => {
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
        // Use AppData in production
        const appDataPath =
            process.env.APPDATA ||
            (process.platform == "darwin" ?
                process.env.HOME + "/Library/Preferences" :
                process.env.HOME + "/.local/share");
        return path.join(appDataPath, "my-nextron-app", "uploads");
    } else {
        // Use public directory in development
        return path.join(process.cwd(), "renderer", "public", "upload");
    }
};

// Categories handlers
const categoryHandlers = {
    createCategory: async (event, {
        name,
        description
    }) => {
        try {
            const id = generateUUID();
            const result = categoryQueries.create.run(id, name, description);
            return {
                success: true,
                id,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    getAllCategories: async () => {
        try {
            const categories = categoryQueries.getAll.all();
            return {
                success: true,
                categories,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    getCategoryById: async (event, {
        id
    }) => {
        try {
            const category = categoryQueries.getById.get(id);
            return {
                success: true,
                category,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    updateCategory: async (event, {
        id,
        name,
        description
    }) => {
        try {
            categoryQueries.update.run(name, description, id);
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    deleteCategory: async (event, {
        id
    }) => {
        try {
            categoryQueries.delete.run(id);
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    searchCategories: async (event, {
        searchTerm
    }) => {
        try {
            const categories = categoryQueries.search.all(`%${searchTerm}%`);
            return {
                success: true,
                categories,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },
};

// Products handlers
const productHandlers = {
    uploadImage: async (event, {
        name,
        type,
        data
    }) => {
        try {
            console.log("Received file data:", {
                name,
                type,
                dataLength: data ? data.length : 0,
            });

            const uploadDir = getUploadDir();
            console.log("Upload directory:", uploadDir);

            if (!fs.existsSync(uploadDir)) {
                console.log("Creating upload directory");
                fs.mkdirSync(uploadDir, {
                    recursive: true,
                });
            }

            // Generate unique filename
            const fileExtension = path.extname(name);
            const timestamp = Date.now();
            const uniqueId = crypto.randomUUID().slice(0, 8);
            const uniqueFilename = `${timestamp}-${uniqueId}${fileExtension}`;

            const filePath = path.join(uploadDir, uniqueFilename);
            console.log("Writing file to:", filePath);

            // Convert the array back to Buffer and write it
            const buffer = Buffer.from(data);
            fs.writeFileSync(filePath, buffer);
            console.log("File written successfully");

            // In production, we need to serve files from the AppData directory
            const isProd = process.env.NODE_ENV === "production";
            const relativePath = isProd ? filePath : `/upload/${uniqueFilename}`;

            return {
                success: true,
                filePath: relativePath,
            };
        } catch (error) {
            console.error("Error in uploadImage handler:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    createProduct: async (event, data) => {
        try {
            const id = generateUUID();
            const stockId = generateUUID();

            // Convert boolean to integer for SQLite
            const isNA = data.isNA ? 1 : 0;

            // Create product with isNA field
            productQueries.create.run(
                id,
                data.name,
                data.description,
                data.price,
                data.category_id,
                data.image_path,
                isNA
            );

            // If not N/A, create stock record
            if (!data.isNA) {
                stockQueries.create.run(
                    stockId,
                    id,
                    data.stock || 0
                );
            }

            return { success: true, id };
        } catch (error) {
            console.error("Error creating product:", error);
            return { success: false, error: error.message };
        }
    },

    getAllProducts: async () => {
        try {
            const products = productQueries.getAll.all().map(product => {
                // Get stock information for each product
                const stockInfo = stockQueries.getByProductId.get(product.id);
                return {
                    ...product,
                    // Convert integer back to boolean
                    isNA: product.isNA === 1,
                    stock: product.isNA === 1 ? null : (stockInfo?.stock_quantity || 0)
                };
            });
            return { success: true, products };
        } catch (error) {
            console.error("Error getting products:", error);
            return { success: false, error: error.message };
        }
    },

    getProductById: async (event, {
        id
    }) => {
        try {
            const product = productQueries.getById.get(id);
            return {
                success: true,
                product,
            };
        } catch (error) {
            console.error("Error getting product:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    updateProduct: async (event, data) => {
        try {
            // Convert boolean to integer for SQLite
            const isNA = data.isNA ? 1 : 0;

            // Update product with isNA field
            productQueries.update.run(
                data.name,
                data.description,
                data.price,
                data.category_id,
                data.image_path,
                isNA,
                data.id
            );

            // Handle stock updates
            if (data.isNA) {
                // If marked as N/A, remove any existing stock record
                stockQueries.delete.run(data.id);
            } else {
                const stockRecord = stockQueries.getByProductId.get(data.id);
                if (stockRecord) {
                    // Update existing stock record
                    stockQueries.update.run(data.stock || 0, data.id);
                } else {
                    // Create new stock record
                    const stockId = generateUUID();
                    stockQueries.create.run(
                        stockId,
                        data.id,
                        data.stock || 0
                    );
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Error updating product:", error);
            return { success: false, error: error.message };
        }
    },

    deleteProduct: async (event, {
        id
    }) => {
        try {
            // Get the product to check its image
            const product = productQueries.getById.get(id);
            if (product && product.image_path) {
                try {
                    const imagePath = path.join(
                        process.cwd(),
                        "renderer",
                        "public",
                        product.image_path
                    );
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                        console.log("Deleted product image:", imagePath);
                    }
                } catch (error) {
                    console.error("Error deleting product image:", error);
                    // Continue with the deletion even if image deletion fails
                }
            }

            productQueries.delete.run(id);
            return {
                success: true,
            };
        } catch (error) {
            console.error("Error deleting product:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    searchProducts: async (event, {
        searchTerm
    }) => {
        try {
            const searchPattern = `%${searchTerm}%`;
            const products = productQueries.search.all(searchPattern);
            return {
                success: true,
                products,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },
};

// Orders handlers
const orderHandlers = {
    createOrder: async (event, {
        items,
        totalAmount
    }) => {
        try {
            const orderId = generateUUID();
            const {
                lastInsertRowid
            } = orderQueries.create.run(
                totalAmount,
                "pending"
            );

            for (const item of items) {
                orderQueries.createOrderItem.run(
                    orderId,
                    item.productId,
                    item.quantity,
                    item.price
                );
            }

            return {
                success: true,
                orderId,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    getAllOrders: async () => {
        try {
            const orders = orderQueries.getAll.all();
            return {
                success: true,
                orders,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    getOrderById: async (event, {
        id
    }) => {
        try {
            const order = orderQueries.getById.get(id);
            const items = orderQueries.getOrderItems.all(id);
            return {
                success: true,
                order: {
                    ...order,
                    items,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    updateOrderStatus: async (event, {
        id,
        status
    }) => {
        try {
            orderQueries.updateStatus.run(status, id);
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    searchOrders: async (event, {
        searchTerm
    }) => {
        try {
            const orders = orderQueries.search.all(`%${searchTerm}%`);
            return {
                success: true,
                orders,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },
};
// User handlers
const userHandlers = {
    createUser: async (event, data) => {
        try {
            const {
                username,
                password,
                full_name,
                role_id,
                status
            } = data;
            const hashedPassword = await bcrypt.hash(password, 10);
            const id = generateUUID();

            userQueries.create.run(
                id,
                username,
                hashedPassword,
                full_name,
                role_id,
                status
            );
            return {
                success: true,
            };
        } catch (error) {
            console.error("Error in createUser:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    getAllUsers: async () => {
        try {
            const users = userQueries.getAll.all();
            // Don't send password and sensitive info to frontend
            const sanitizedUsers = users.map((user) => {
                const {
                    password,
                    ...rest
                } = user;
                // Get role name for each user
                const roleInfo = roleQueries.getRoleName.get(user.role_id);
                return {
                    ...rest,
                    role_name: roleInfo ? roleInfo.role_name : "Unknown Role",
                };
            });
            return {
                success: true,
                users: sanitizedUsers,
            };
        } catch (error) {
            console.error("Error in getAllUsers:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    updateUser: async (event, data) => {
        try {
            const {
                id,
                username,
                full_name,
                role_id,
                status
            } = data;
            userQueries.update.run(username, full_name, role_id, status, id);
            return {
                success: true,
            };
        } catch (error) {
            console.error("Error in updateUser:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    deleteUser: async (event, data) => {
        try {
            const {
                id,
                adminPassword
            } = data;

            // Get admin user and verify admin password
            const admin = userQueries.getByUsername.get("admin");
            if (!admin) {
                return {
                    success: false,
                    error: "Admin account not found",
                };
            }

            const isValidAdminPassword = await bcrypt.compare(
                adminPassword,
                admin.password
            );
            if (!isValidAdminPassword) {
                return {
                    success: false,
                    error: "Admin password is incorrect",
                };
            }

            // Prevent deleting the admin user
            const userToDelete = userQueries.getById.get(id);
            if (!userToDelete) {
                return {
                    success: false,
                    error: "User not found",
                };
            }

            if (userToDelete.username === "admin") {
                return {
                    success: false,
                    error: "Cannot delete the admin user",
                };
            }

            // Delete the user
            userQueries.delete.run(id);
            return {
                success: true,
            };
        } catch (error) {
            console.error("Error in deleteUser:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    resetUserPassword: async (event, data) => {
        try {
            const {
                id,
                username,
                currentPassword,
                adminPassword,
                newPassword,
                resetMethod,
            } = data;

            // Get the user
            const user = userQueries.getById.get(id);
            if (!user) {
                return {
                    success: false,
                    error: "User not found",
                };
            }

            // Prevent resetting admin password through this endpoint
            if (user.username === "admin") {
                return {
                    success: false,
                    error: "Admin password cannot be reset through this endpoint",
                };
            }

            if (resetMethod === "self") {
                // Verify current password
                const isValidPassword = await bcrypt.compare(
                    currentPassword,
                    user.password
                );
                if (!isValidPassword) {
                    return {
                        success: false,
                        error: "Current password is incorrect",
                    };
                }
            } else if (resetMethod === "admin") {
                // Get admin user and verify admin password
                const admin = userQueries.getByUsername.get("admin");
                if (!admin) {
                    return {
                        success: false,
                        error: "Admin account not found",
                    };
                }

                const isValidAdminPassword = await bcrypt.compare(
                    adminPassword,
                    admin.password
                );
                if (!isValidAdminPassword) {
                    return {
                        success: false,
                        error: "Admin password is incorrect",
                    };
                }
            } else {
                return {
                    success: false,
                    error: "Invalid reset method",
                };
            }

            // Validate new password
            if (!newPassword || newPassword.length < 6) {
                return {
                    success: false,
                    error: "New password must be at least 6 characters long",
                };
            }

            // Hash and update the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            userQueries.updatePassword.run(hashedPassword, id);
            userQueries.resetLoginAttempts.run(user.username);

            return {
                success: true,
                message: "Password reset successfully",
            };
        } catch (error) {
            console.error("Error in resetUserPassword:", error);
            return {
                success: false,
                error: error.message || "Failed to reset password",
            };
        }
    },
    login: async (event, credentials) => {
        try {
            const {
                username,
                password
            } = credentials;
            const user = userQueries.findByUsername.get(username);
            const role = roleQueries.getRolePermissions.get(user.role_id);
            console.log(user);
            console.log(role);

            if (!user) {
                return {
                    success: false,
                    error: "Invalid username or password",
                };
            }
            if (user.status === "inactive") {
                return {
                    success: false,
                    error: "Your account is inactive",
                };
            }
            if (user.status === "suspended") {
                return {
                    success: false,
                    error: "Your account is suspended",
                };
            }
            if (!role) {
                return {
                    success: false,
                    error: "Please assign a role to this user",
                };
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return {
                    success: false,
                    error: "Invalid username or password",
                };
            }

            // Don't send password in response
            const {
                password: _,
                ...userWithoutPassword
            } = user;

            return {
                success: true,
                user: userWithoutPassword,
                userRole: role,
            };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: "An error occurred during login",
            };
        }
    },
};
// Payments handlers
const paymentHandlers = {
    savePayment: async (event, data) => {
        try {
            const {
                id,
                order_id,
                amount,
                payment_method,
                payment_date,
                subtotal,
                discount,
                tax,
                total,
                amount_received,
                change_amount,
                status,
                created_at,
                orderItems,
                cashier
            } = data;

            // Save payment first
            paymentQueries.create.run(
                id,
                order_id,
                amount,
                payment_method,
                payment_date,
                subtotal,
                discount,
                tax,
                total,
                amount_received,
                change_amount,
                status,
                created_at,
                cashier,
            );

            // Save each purchased item and update stock
            if (orderItems && Array.isArray(orderItems)) {
                for (const item of orderItems) {
                    const invoicedItemId = generateUUID();
                    
                    // Save the invoiced item
                    invoicedItemQueries.create.run(
                        invoicedItemId,
                        id, // payment_id
                        item.id, // product_id
                        item.quantity,
                        item.price
                    );

                    // Get product details to check if it's N/A
                    const product = productQueries.getById.get(item.id);
                    if (product && !product.isNA) {
                        // Get current stock
                        const stockInfo = stockQueries.getByProductId.get(item.id);
                        if (stockInfo) {
                            // Update stock quantity
                            const newQuantity = Math.max(0, stockInfo.stock_quantity - item.quantity);
                            stockQueries.update.run(newQuantity, item.id);
                        }
                    }
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Error saving payment:", error);
            return { success: false, error: error.message };
        }
    },

    // Add a function to validate stock before payment
    validatePaymentStock: async (event, orderItems) => {
        try {
            for (const item of orderItems) {
                // Get product details
                const product = productQueries.getById.get(item.id);
                if (!product) {
                    return {
                        success: false,
                        error: `Product not found: ${item.id}`
                    };
                }

                // Skip stock validation for N/A products
                if (product.isNA) {
                    continue;
                }

                // Check stock availability
                const stockInfo = stockQueries.getByProductId.get(item.id);
                if (!stockInfo || stockInfo.stock_quantity < item.quantity) {
                    const available = stockInfo ? stockInfo.stock_quantity : 0;
                    return {
                        success: false,
                        error: `Insufficient stock for ${product.name}. Available: ${available}, Requested: ${item.quantity}`
                    };
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Error validating stock:", error);
            return { success: false, error: error.message };
        }
    },
    
    getAllPayments: () => {
        try {
            const payments = paymentQueries.getAll.all();
            return {
                success: true,
                payments: payments,
            };
        } catch (error) {
            console.error("Error fetching payments:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
    getPaymentById: (event, {
        id
    }) => {
        try {
            const payment = paymentQueries.getById.get(id);
            return {
                success: true,
                data: payment,
            };
        } catch (error) {
            console.error("Error fetching payment:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
    getPaymentByOrderId: (event, {
        orderId
    }) => {
        try {
            const payment = paymentQueries.getByOrderId.get(orderId);
            return {
                success: true,
                data: payment,
            };
        } catch (error) {
            console.error("Error fetching payment by order:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
    searchPayments: (event, {
        searchTerm
    }) => {
        try {
            const term = `%${searchTerm}%`;
            const payments = paymentQueries.searchPayments.all(term, term, term);
            return {
                success: true,
                data: payments,
            };
        } catch (error) {
            console.error("Error searching payments:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
};
// Hold Orders handlers
const holdOrderHandlers = {
    checkReference: async (event, {
        reference
    }) => {
        try {
            const result = holdOrderQueries.checkReference.get(reference);
            return {
                success: true,
                exists: result.count > 0,
            };
        } catch (error) {
            console.error("Error checking reference:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    createHoldOrder: async (
        event, {
            reference,
            items,
            total_items,
            total_amount
        }
    ) => {
        try {
            const id = generateUUID();
            holdOrderQueries.create.run(
                id,
                reference,
                JSON.stringify(items),
                total_items,
                total_amount
            );
            return {
                success: true,
                id,
            };
        } catch (error) {
            console.error("Error creating held order:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    updateHoldOrder: async (
        event, {
            id,
            reference,
            items,
            total_items,
            total_amount
        }
    ) => {
        try {
            holdOrderQueries.update.run(
                reference,
                JSON.stringify(items),
                total_items,
                total_amount,
                id
            );
            return {
                success: true,
            };
        } catch (error) {
            console.error("Error updating held order:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    getAllHoldOrders: async () => {
        try {
            const orders = holdOrderQueries.getAll.all().map((order) => ({
                ...order,
                items: JSON.parse(order.items),
            }));
            return {
                success: true,
                orders,
            };
        } catch (error) {
            console.error("Error getting held orders:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    deleteHoldOrder: async (event, {
        id
    }) => {
        try {
            holdOrderQueries.delete.run(id);
            return {
                success: true,
            };
        } catch (error) {
            console.error("Error deleting held order:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
};
// Role handlers
const roleHandlers = {
    getAllRoles: async () => {
        try {
            const roles = roleQueries.getAll.all();
            return {
                success: true,
                roles,
            };
        } catch (error) {
            console.error("Error in getAllRoles:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
};

// Bill Template handlers
const billTemplateHandlers = {
    createBillTemplate: async (event, data) => {
        try {
            const id = generateUUID();
            const result = billTemplateQueries.create.run(
                id,
                data.company_name,
                data.address,
                data.phone,
                data.email,
                data.website,
                data.tax_id,
                data.footer_text,
                data.show_logo ? 1 : 0,
                data.show_tax_id ? 1 : 0,
                data.show_footer ? 1 : 0,
                data.logo_path,
                data.bill_width
            );

            return {
                success: true,
                id,
            };
        } catch (error) {
            console.error("Error in createBillTemplate:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    updateBillTemplate: async (event, data) => {
        try {
            billTemplateQueries.update.run(
                data.company_name,
                data.address,
                data.phone,
                data.email,
                data.website,
                data.tax_id,
                data.footer_text,
                data.show_logo ? 1 : 0,
                data.show_tax_id ? 1 : 0,
                data.show_footer ? 1 : 0,
                data.logo_path,
                data.bill_width,
                data.id
            );

            return {
                success: true,
            };
        } catch (error) {
            console.error("Error in updateBillTemplate:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    getAllBillTemplates: async () => {
        try {
            const templates = billTemplateQueries.getAll.all();
            return {
                success: true,
                templates,
            };
        } catch (error) {
            console.error("Error in getAllBillTemplates:", error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
};

//report
const reportHandlers = {
    getSalesReport: async (event, { startDate, endDate }) => {
        try {
            // Use the prepared statement from paymentQueries
            const report = paymentQueries.getSalesReportData.all(startDate, endDate);
            
            return {
                success: true,
                report
            };
        } catch (error) {
            console.error('Error in getSalesReport:', error);
            return {
                success: false,
                error: error.message || 'Failed to get sales report'
            };
        }
    }
};

export {
    categoryHandlers,
    productHandlers,
    orderHandlers,
    holdOrderHandlers,
    paymentHandlers,
    userHandlers,
    roleHandlers,
    billTemplateHandlers,
    reportHandlers,
};