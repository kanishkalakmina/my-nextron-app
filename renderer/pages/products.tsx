import React, { useState } from 'react';
import Head from 'next/head';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

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
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Product
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Search products..."
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Example Product Card - Replace with actual data */}
          <div className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
            <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-200">
              <div className="h-48 w-full bg-gray-200" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">Example Product</h3>
              <p className="mt-1 text-sm text-gray-500">Category</p>
              <p className="mt-1 text-sm font-medium text-gray-900">$0.00</p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 text-gray-500" />
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ProductsPage;
