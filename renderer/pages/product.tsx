import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { useIPC } from '../hooks/useIPC';
import { toast } from 'react-hot-toast';

// Product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category_id: number;
  category_name: string;
}

// Initial form state
const initialProductForm = {
  id: null as number | null,
  name: '',
  description: '',
  price: 0,
  image: null as string | null,
  category_id: null as number | null
};

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load products and categories
  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const result = await window.electron.getAllProducts();
      console.log('Products result:', result);
      if (result.success) {
        setProducts(result.products);
        console.log('Products loaded:', result.products);
      } else {
        console.error('Failed to load products:', result.error);
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    }
  };

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const result = await window.electron.getAllCategories();
      console.log('Categories result:', result);
      if (result.success) {
        setCategories(result.categories);
        console.log('Categories loaded:', result.categories);
      } else {
        console.error('Failed to load categories:', result.error);
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    console.log('Product page mounted');
    loadProducts();
    loadCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      if (isEditing) {
        result = await window.electron.updateProduct({
          id: productForm.id,
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          categoryId: productForm.category_id,
          image: productForm.image
        });
      } else {
        result = await window.electron.createProduct({
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          categoryId: productForm.category_id,
          image: productForm.image
        });
      }

      if (result.success) {
        toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
        setIsModalOpen(false);
        setProductForm(initialProductForm);
        setIsEditing(false);
        loadProducts();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  // Handle edit click
  const handleEdit = async (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category_id: product.category_id
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Handle delete click
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const result = await window.electron.deleteProduct({ id });
      if (result.success) {
        toast.success('Product deleted successfully');
        loadProducts();
      } else {
        toast.error(result.error || 'Failed to delete product');
      }
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const result = await window.electron.searchProducts(searchTerm);
      if (result.success) {
        setProducts(result.products);
      } else {
        toast.error('Search failed');
      }
    } else {
      loadProducts();
    }
  };

  // Handle image selection
  const handleImageSelect = async () => {
    const result = await window.electron.selectImage();
    if (result.success) {
      setProductForm({ ...productForm, image: result.imagePath });
    } else {
      toast.error('Failed to select image');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Products - POS System</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your products inventory, prices, and categories
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setProductForm(initialProductForm);
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex max-w-md gap-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search products..."
          />
          <button
            type="button"
            onClick={handleSearch}
            className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Products Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Image
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image || '/placeholder.png'}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-gray-500">{product.description}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.category_name}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h3>
                  </div>

                  {/* Name field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                      Name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="name"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>

                  {/* Description field */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                      Description
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="description"
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Enter product description"
                      />
                    </div>
                  </div>

                  {/* Price field */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                      Price
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="price"
                        required
                        step="0.01"
                        min="0"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                        className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Enter price"
                      />
                    </div>
                  </div>

                  {/* Category field */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                      Category
                    </label>
                    <div className="mt-2">
                      <select
                        id="category"
                        required
                        value={productForm.category_id || ''}
                        onChange={(e) => setProductForm({ ...productForm, category_id: parseInt(e.target.value) })}
                        className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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

                  {/* Image field */}
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Product Image
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {productForm.image ? (
                          <Image
                            src={productForm.image || '/placeholder.png'}
                            alt=""
                            width={96}
                            height={96}
                            className="h-full w-full object-cover object-center"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-50">
                            <PhotoIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleImageSelect}
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setProductForm(initialProductForm);
                      setIsEditing(false);
                    }}
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductPage;
