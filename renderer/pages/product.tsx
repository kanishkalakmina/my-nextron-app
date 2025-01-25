import path from 'path';
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
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
  });

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
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
    if (!imagePath) return '';
    
    if (process.env.NODE_ENV === 'production') {
      // Use custom protocol in production
      return `upload://${path.basename(imagePath)}`;
    }
    // Use relative path in development
    return imagePath;
  };

  return (
    <Layout>
      <Head>
        <title>Products - POS System</title>
      </Head>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </button>
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
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product.category_name || "-"}
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
                        Price
                      </label>
                      <div className="mt-2 relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="price"
                          required
                          step="0.01"
                          min="0"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price: parseFloat(e.target.value),
                            })
                          }
                          className="block w-full rounded-lg border-0 py-2 pl-7 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 hover:ring-gray-400 transition-shadow duration-200 sm:text-sm sm:leading-6"
                          placeholder="0.00"
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
                                      : productForm.existingImagePath
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
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        itemName={productToDelete?.name || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Layout>
  );
};

export default ProductPage;
