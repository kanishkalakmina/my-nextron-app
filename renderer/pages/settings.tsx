import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

const SettingsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Settings - Point of Sale</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Settings page content will go here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
