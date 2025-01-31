import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import BillPreview from "../components/BillPreview";
import toast from "react-hot-toast";
import { useIPC } from "../hooks/useIPC";

interface BillSettings {
  id: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  footerText: string;
  showLogo: boolean;
  showTaxId: boolean;
  showFooter: boolean;
  logo: string;
  billWidth: number;
}

export default function BillSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<BillSettings>({
    id: "",
    companyName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxId: "",
    footerText: "Thank you for your business!",
    showLogo: true,
    showTaxId: true,
    showFooter: true,
    logo: "",
    billWidth: 600,
  });

  const { loading, error, createBillTemplate } = useIPC({
    onError: (error) => {
      console.error("Error:", error);
      toast.error(error);
    },
  });

  // Load existing bill template data
  useEffect(() => {
    const loadBillTemplate = async () => {
      try {
        const result = await window.electron.getAllBillTemplates();
        if (result.success && result.templates && result.templates.length > 0) {
          const template = result.templates[0]; // Get the first template
          setSettings({
            id: template.id,
            companyName: template.company_name,
            address: template.address,
            phone: template.phone,
            email: template.email,
            website: template.website,
            taxId: template.tax_id,
            footerText: template.footer_text,
            showLogo: Boolean(template.show_logo),
            showTaxId: Boolean(template.show_tax_id),
            showFooter: Boolean(template.show_footer),
            logo: template.logo_path || "",
            billWidth: template.bill_width,
          });
        }
      } catch (error) {
        console.error("Error loading bill template:", error);
        toast.error("Failed to load bill template");
      }
    };

    loadBillTemplate();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Read file as array buffer
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        // Upload the image
        const result = await window.electron.uploadImage({
          name: file.name,
          type: file.type,
          data: Array.from(uint8Array),
        });

        if (result.success) {
          setSettings((prev) => ({
            ...prev,
            logo: result.filePath,
          }));
          toast.success("Logo uploaded successfully");
        } else {
          toast.error(result.error || "Failed to upload logo");
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        toast.error("Failed to upload logo");
      }
    }
  };

  const handleBillWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value);
    setSettings((prev) => ({
      ...prev,
      billWidth: width,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await window.electron.updateBillTemplate({
        id: settings.id,
        company_name: settings.companyName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        tax_id: settings.taxId,
        footer_text: settings.footerText,
        show_logo: settings.showLogo,
        show_tax_id: settings.showTaxId,
        show_footer: settings.showFooter,
        logo_path: settings.logo,
        bill_width: settings.billWidth,
      });

      if (result.success) {
        toast.success("Bill template Updated successfully");
      } else {
        toast.error(result.error || "Failed to save bill template");
      }
    } catch (error) {
      console.error("Error saving bill template:", error);
      toast.error("Failed to save bill template");
    }
  };

  return (
    <Layout>
      <Head>
        <title>Bill Settings - Point of Sale</title>
      </Head>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left side - Settings Form */}
        <div className="w-1/2 p-6 overflow-y-auto border-r">
          <h1 className="text-2xl font-bold mb-6">Bill Settings</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo and Bill Width Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Visual Settings
              </h3>
              <div className="space-y-4">
                {/* Logo Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {settings.logo && (
                      <img
                        src={settings.logo}
                        alt="Company Logo"
                        className="h-16 w-auto object-contain"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {settings.logo ? "Change Logo" : "Upload Logo"}
                    </button>
                    {settings.logo && (
                      <button
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, logo: "" }))
                        }
                        className="px-4 py-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Bill Width Slider */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bill Width: {settings.billWidth}px
                  </label>
                  <input
                    type="range"
                    name="billWidth"
                    min="300"
                    max="800"
                    step="50"
                    value={settings.billWidth}
                    onChange={handleBillWidthChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={settings.taxId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={settings.website}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer Settings Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Footer Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Footer Text
                  </label>
                  <textarea
                    name="footerText"
                    value={settings.footerText}
                    onChange={handleChange}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="showLogo"
                      checked={settings.showLogo}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Show Logo
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="showTaxId"
                      checked={settings.showTaxId}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Show Tax ID
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="showFooter"
                      checked={settings.showFooter}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Show Footer
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 mt-6 -mx-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Update Bill Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Bill Preview */}
        <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Bill Preview</h2>
          <div className="flex justify-center">
            <BillPreview settings={settings} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
