import React from "react";
import { useAccount } from "wagmi";

interface ActionButton {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

interface TitleBarProps {
  title: string;
  icon?: React.ReactNode;
  actions?: ActionButton[];
}

const TitleBar: React.FC<TitleBarProps> = ({ title, icon, actions = [] }) => {
  const { address, isConnected } = useAccount();
  return (
    <div className="w-full flex items-center justify-between py-3 px-1">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>
      <div>Connected: {isConnected ? "✅ YES" : "❌ NO"}</div>
      <div>Address: {address || "None"}</div>
      {/* Right Section */}
      <div className="flex items-center h-3 gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm bg-[#2E2E2E] hover:bg-[#3A3A3A]  ${
              action.className || ""
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TitleBar;
