import React from "react";
import { BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function TopBar() {
  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">Point of Sale</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          <BellIcon className="h-6 w-6" />
        </button>
        <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
          <UserCircleIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
