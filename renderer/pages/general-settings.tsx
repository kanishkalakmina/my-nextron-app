import React, { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { useIPC } from "../hooks/useIPC";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

export default function GeneralSettingsPage() {
  const [taxRate, setTaxRate] = useState("");
  const { updateGeneralSettings, getGeneralSettings } = useIPC();
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await getGeneralSettings();
    if (result?.success && result.settings) {
      const tax = result.settings.find(s => s.setting_name === 'tax_rate');
      if (tax) {
        setTaxRate(tax.setting_value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateGeneralSettings({
      id: uuidv4(),
      setting_name: 'tax_rate',
      setting_value: taxRate
    });

    if (result?.success) {
      toast.success('Tax rate updated successfully');
      loadSettings();
    } else {
      toast.error(result?.error || 'Failed to update tax rate');
    }
  };

  return (
    <Layout>
      <Head>
        <title>General Settings - Point of Sale</title>
      </Head>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.push('/settings')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">General Settings</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 max-w-xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter tax rate"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}