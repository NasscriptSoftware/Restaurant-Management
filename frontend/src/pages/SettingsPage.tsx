import React from "react";
import Layout from "../components/Layout/Layout";
import SettingItem from "../components/Settings/SettingItem";

const settingsItems = [
  { label: "What's new", url: "/whats-new" },
  { label: "About us", url: "/about-us" },
  { label: "Support", url: "/support" },
  { label: "Dining Table", url: "/dining-table" },
  { label: "Coupons", url: "/coupons" },
  { label: "Admin Pannel" },
  { label: "Developer Option" } // New item for Developer Option
];


const SettingsPage: React.FC = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-white">
        {settingsItems.map((item, index) => (
          <SettingItem
            key={index}
            label={item.label}
            url={item.url} 
            className="text-center whitespace-nowrap min-w-max"
          />
        ))}
      </div>
    </Layout>
  );
};

export default SettingsPage;
