import React from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import {
  FaFileInvoiceDollar,
  FaCog,
  FaChartBar,
  FaTools,
} from "react-icons/fa";
import { useRouter } from "next/router";

interface SettingsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => (
  <div
    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center mb-4">
      <div className="text-blue-600 text-2xl">{icon}</div>
      <h2 className="text-xl font-semibold ml-3">{title}</h2>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

const SettingsPage = () => {
  const router = useRouter();

  const handleCardClick = (setting: string) => {
    if (setting === "bill") {
      router.push("/bill-settings");
    } else if (setting === "general"){
      router.push("/general-settings");
    } else {
      // Handle other settings
      console.log(`Clicked ${setting} settings`);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Settings - Point of Sale</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SettingsCard
            title="Bill Settings"
            description="Configure invoice format, tax rates, and billing preferences"
            icon={<FaFileInvoiceDollar />}
            onClick={() => handleCardClick("bill")}
          />
          {/* <SettingsCard
            title="System Settings"
            description="Manage system configurations, users, and permissions"
            icon={<FaCog />}
            onClick={() => handleCardClick("system")}
          />
          <SettingsCard
            title="Report Settings"
            description="Customize report layouts and scheduling options"
            icon={<FaChartBar />}
            onClick={() => handleCardClick("report")}
          /> */}
          <SettingsCard
            title="General Settings"
            description="Configure general application preferences and options"
            icon={<FaTools />}
            onClick={() => handleCardClick("general")}
          />
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
