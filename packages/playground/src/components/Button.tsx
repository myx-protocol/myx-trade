import React from "react";

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled=false }) => {
  return (
    <button
      className={'px-[16px] py-[8px] rounded-[6px] border-1 border-[#ccc] bg-[#f5f5f5] hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"'}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
