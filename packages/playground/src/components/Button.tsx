import React from "react";

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled=false, isLoading =false }) => {
  if (isLoading) {
    return <div className={'px-[16px] py-[8px] text-center rounded-[6px] border-1 border-[#ccc] bg-[#f5f5f5] text-[#000] cursor-not-allowed"'}
    >Loading...</div>;
  }
  return (
    <button
      className={'px-[16px] py-[8px] rounded-[6px] border-1 border-[#ccc] bg-[#1677ff] text-[#fff] hover:opacity-75  disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed'}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
