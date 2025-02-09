import path from "path";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Layout from "../components/Layout";
import { useIPC } from "../hooks/useIPC";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category_name: string;
  image_path?: string;
  stock: number;
  isNA: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: File | null;
  existingImagePath: string | null;
  stock: number;
  isNA: boolean;
}

interface StockUpdateForm {
  product_id: string;
  stock: number;
}

interface LowStockNotification {
  id: string;
  productName: string;
  stock: number;
  timestamp: Date;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    image: null,
    existingImagePath: null,
    stock: 0,
    isNA: false,
  });
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockForm, setStockForm] = useState<StockUpdateForm>({
    product_id: "",
    stock: 0,
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockNotifications, setLowStockNotifications] = useState<LowStockNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await window.electron.getAllProducts();
      if (result.success) {
        console.log("Products loaded:", result.products); // Debug log
        setProducts(result.products);
        // Check for low stock whenever products are loaded
        checkLowStock(result.products);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
  };

  const loadCategories = async () => {
    try {
      const result = await window.electron.getAllCategories();
      if (result.success) {
        setCategories(result.categories);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price,
        category_id: product.category_id || "",
        image: null,
        existingImagePath: product.image_path,
        stock: product.stock,
        isNA: product.isNA || false,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        image: null,
        existingImagePath: null,
        stock: 0,
        isNA: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: 0,
      category_id: "",
      image: null,
      existingImagePath: null,
      stock: 0,
      isNA: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if a product with the same name already exists
      const existingProduct = products.find(
        (p) => p.name.toLowerCase() === productForm.name.toLowerCase() && p.id !== editingProduct?.id
      );

      if (existingProduct) {
        toast.error("A product with this name already exists!");
        return;
      }

      let imagePath = productForm.existingImagePath;

      if (productForm.image) {
        try {
          // Convert File to ArrayBuffer for IPC transfer
          const arrayBuffer = await productForm.image.arrayBuffer();
          const fileData = {
            name: productForm.image.name,
            type: productForm.image.type,
            data: Array.from(new Uint8Array(arrayBuffer)),
          };
          console.log("Uploading image:", {
            name: fileData.name,
            type: fileData.type,
          });
          const uploadResult = await window.electron.uploadImage(fileData);
          console.log("Upload result:", uploadResult);

          if (!uploadResult.success) {
            toast.error("Failed to upload image");
            return;
          }
          imagePath = uploadResult.filePath;
        } catch (error) {
          console.error("Error in image upload:", error);
          toast.error(`Error uploading image: ${error.message}`);
          return;
        }
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        category_id: productForm.category_id,
        image_path: imagePath,
        stock: productForm.stock,
        isNA: productForm.isNA,
      };

      console.log("Submitting product data:", {
        ...productData,
        isEdit: !!editingProduct,
        editId: editingProduct?.id,
      });

      if (editingProduct) {
        const result = await window.electron.updateProduct({
          id: editingProduct.id,
          ...productData,
        });
        console.log("Update result:", result);

        if (result.success) {
          toast.success("Product updated successfully");
          loadProducts();
          handleCloseModal();
        } else {
          console.error("Update failed:", result.error);
          toast.error(result.error || "Failed to update product");
        }
      } else {
        const result = await window.electron.createProduct(productData);
        console.log("Create result:", result);

        if (result.success) {
          toast.success("Product created successfully");
          loadProducts();
          handleCloseModal();
        } else {
          console.error("Create failed:", result.error);
          toast.error(result.error || "Failed to create product");
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("An error occurred while saving the product");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Clear the input value to allow selecting the same file again
    e.target.value = "";

    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, or GIF)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setProductForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        const result = await window.electron.deleteProduct(productToDelete.id);
        if (result.success) {
          toast.success("Product deleted successfully");
          loadProducts();
        } else {
          toast.error(result.error || "Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleSearch = async () => {
    try {
      if (searchTerm.trim()) {
        const result = await window.electron.searchProducts(searchTerm);
        if (result.success) {
          setProducts(result.products);
        } else {
          toast.error("Search failed");
        }
      } else {
        loadProducts();
      }
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Search failed");
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";

    if (process.env.NODE_ENV === "production") {
      // Use custom protocol in production
      return `upload://${path.basename(imagePath)}`;
    }
    // Use relative path in development
    return imagePath;
  };

  const handleOpenStockModal = () => {
    setIsStockModalOpen(true);
    setFilteredProducts(products.filter(p => !p.isNA));
  };

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
    setStockForm({
      product_id: "",
      stock: 0,
    });
    setSearchQuery("");
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const filtered = products.filter(product => 
      !product.isNA && product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const checkLowStock = (productList: Product[]) => {
    const notifications: LowStockNotification[] = productList
      .filter(product => !product.isNA && product.stock <= 5)
      .map(product => ({
        id: product.id,
        productName: product.name,
        stock: product.stock,
        timestamp: new Date()
      }));

    setLowStockNotifications(notifications);
    
    // Remove the automatic toast notifications
    // notifications.forEach(notification => {
    //   toast.error(
    //     `Low stock alert: ${notification.productName} has only ${notification.stock} items remaining`,
    //     { duration: 5000 }
    //   );
    // });
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProduct = products.find(p => p.id === stockForm.product_id);
      if (!selectedProduct) {
        toast.error("Please select a product");
        return;
      }

      // Validate stock quantity
      if (stockForm.stock < 0) {
        toast.error("Stock quantity cannot be negative");
        return;
      }

      // Get current stock information
      const currentStock = selectedProduct.stock || 0;
      
      // Show confirmation if reducing stock
      if (stockForm.stock === 0) {
        toast.error("Stock quantity cannot be 0");
        return;
      }

      const newStock = currentStock + stockForm.stock;
      const result = await window.electron.updateProduct({
        ...selectedProduct,
        stock: newStock,
      });


      if (result.success) {
        toast.success(`Stock updated successfully. New stock: ${stockForm.stock}`);
        
        // Check if stock is low after update
        if (stockForm.stock <= 5) {
          toast.error(`Low stock alert: ${selectedProduct.name} has only ${stockForm.stock} items remaining`, {
            duration: 5000,
          });
        }
        
        loadProducts();
        handleCloseStockModal();
      } else {
        toast.error(result.error || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    }
  };

  const handleDismissNotification = (id: string) => {
    setLowStockNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <Layout notifications={lowStockNotifications} onDismissNotification={handleDismissNotification}>
      <Head>
        <title>Products - POS System</title>
      </Head>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </button>
            <button
              type="button"
              onClick={handleOpenStockModal}
              className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Update Stock
            </button>
          </div>
        </div>

        {/* Search */}
        {/* TODO */}
        {/* <div className="mb-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Search products..."
            />
          </div>
        </div> */}

        {/* Products Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Image
                      </th>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 sm:pl-6">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            {product.image_path ? (
                              <img
                                src={getImageUrl(product.image_path)}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                <svg
                                  className="h-6 w-6 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product.description || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          Rs {product.price.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product.category_name || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product.isNA ? "N/A" : product.stock}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <PencilSquareIcon className="h-5 w-5 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="inline-flex items-center text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 text-center"
                        >
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Product Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Modal backdrop with blur effect */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"
              onClick={handleCloseModal}
            ></div>

            {/* Modal panel with improved styling */}
            <div className="relative transform overflow-hidden rounded-xl bg-white px-8 pb-8 pt-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              {/* Close button with hover effect */}
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none transition-colors duration-200"
                  onClick={handleCloseModal}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {editingProduct
                        ? "Update the product information below"
                        : "Fill in the information below to create a new product"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Name field */}
                    <div className="col-span-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Product Name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="name"
                          required
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              name: e.target.value,
                            })
                          }
                          className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 hover:ring-gray-400 transition-shadow duration-200 sm:text-sm sm:leading-6"
                          placeholder="Enter product name"
                        />
                      </div>
                    </div>

                    {/* Description field */}
                    <div className="col-span-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Description
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          rows={3}
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              description: e.target.value,
                            })
                          }
                          className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 hover:ring-gray-400 transition-shadow duration-200 sm:text-sm sm:leading-6"
                          placeholder="Enter product description"
                        />
                      </div>
                    </div>

                    {/* Price field */}
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Price (Rs)
                      </label>
                      <div className="mt-2 relative">
                        <input
                          type="number"
                          id="price"
                          required
                          step="1"
                          min="0"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price: parseFloat(e.target.value),
                            })
                          }
                          className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 hover:ring-gray-400 transition-shadow duration-200 sm:text-sm sm:leading-6"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Category field */}
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Category
                      </label>
                      <div className="mt-2">
                        <select
                          id="category"
                          required
                          value={productForm.category_id}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              category_id: e.target.value,
                            })
                          }
                          className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 hover:ring-gray-400 transition-shadow duration-200 sm:text-sm sm:leading-6"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Stock field */}
                    {!editingProduct && (
                      <div>
                        <label
                          htmlFor="stock"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Stock
                        </label>
                        <div className="mt-2">
                          <input
                            type="number"
                            id="stock"
                            min="0"
                            value={productForm.stock}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                stock: parseInt(e.target.value) || 0,
                              })
                            }
                            disabled={productForm.isNA}
                            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 hover:ring-gray-400 transition-shadow duration-200 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Enter stock quantity"
                          />
                        </div>
                      </div>
                    )}

                    {/* N/A checkbox */}
                    {!editingProduct && (
                      <div className="flex items-center mt-8">
                        <input
                          type="checkbox"
                          id="isNA"
                          checked={productForm.isNA}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              isNA: e.target.checked,
                              stock: e.target.checked ? 0 : productForm.stock,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="isNA"
                          className="ml-2 block text-sm font-medium leading-6 text-gray-900"
                        >
                          N/A
                        </label>
                      </div>
                    )}

                    {/* Image upload field */}
                    <div className="col-span-2">
                      <label
                        htmlFor="image"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Product Image
                      </label>
                      <div className="mt-2 space-y-4">
                        {/* Image preview */}
                        <div className="flex items-center gap-4">
                          <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            {productForm.existingImagePath ||
                            productForm.image ? (
                              <>
                                <img
                                  src={
                                    productForm.image
                                      ? URL.createObjectURL(productForm.image)
                                      : getImageUrl(
                                          productForm.existingImagePath || ""
                                        )
                                  }
                                  alt="Product preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                                  {productForm.image
                                    ? "New Image"
                                    : "Current Image"}
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-gray-400">
                                <svg
                                  className="w-12 h-12"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="relative">
                              <input
                                type="file"
                                id="image"
                                accept=".jpg,.jpeg,.png,.gif"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none cursor-pointer"
                              />
                            </div>
                            {productForm.image && (
                              <button
                                type="button"
                                onClick={() =>
                                  setProductForm((prev) => ({
                                    ...prev,
                                    image: null,
                                  }))
                                }
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                              >
                                Remove new image
                              </button>
                            )}
                            <p className="text-xs text-gray-500">
                              Accepted formats: JPG, PNG, GIF (max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form actions */}
                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors duration-200"
                    >
                      {editingProduct ? "Update Product" : "Create Product"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Modal backdrop */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"
              onClick={handleCloseStockModal}
            ></div>

            {/* Modal panel */}
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              {/* Close button */}
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={handleCloseStockModal}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal content */}
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Update Stock
                  </h3>
                  <form onSubmit={handleStockSubmit} className="mt-4 space-y-6">
                    {/* Product Search */}
                    <div>
                      <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Product
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                          placeholder="Search product..."
                        />
                        {searchQuery && filteredProducts.length > 0 && (
                          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredProducts.map((product) => (
                              <div
                                key={product.id}
                                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                                  stockForm.product_id === product.id ? 'bg-indigo-50' : 'text-gray-900'
                                }`}
                                onClick={() => {
                                  setStockForm(prev => ({ ...prev, product_id: product.id }));
                                  setSearchQuery(product.name);
                                  setFilteredProducts([]);
                                }}
                              >
                                {product.name}
                                {stockForm.product_id === product.id && (
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                    <CheckIcon className="h-5 w-5" />
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Current Stock */}
                    {stockForm.product_id && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Current Stock:</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {products.find(p => p.id === stockForm.product_id)?.stock || 0}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Stock Input */}
                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                        Stock to Add
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={stockForm.stock}
                        onChange={(e) => setStockForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                        placeholder="Enter stock quantity to add"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseStockModal}
                        className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Update Stock
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        requireAdminPassword={false}
      />
    </Layout>
  );
};

export default ProductPage;
