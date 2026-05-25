import React from 'react';
import { Search, Bell, Moon } from 'lucide-react';

const TopHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between bg-white p-4 shadow rounded">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search platform..."
            className="border rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Bell className="text-gray-600 hover:text-gray-800 cursor-pointer" />
        <Moon className="text-gray-600 hover:text-gray-800 cursor-pointer" />
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

export default TopHeader;