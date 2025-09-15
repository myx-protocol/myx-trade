import React from "react";

export interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button
      style={{
        padding: "8px 16px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        background: "#f5f5f5",
        cursor: "pointer"
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
