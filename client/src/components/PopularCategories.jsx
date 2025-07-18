import React from "react";
import {
  FaLaptopCode,
  FaPaintBrush,
  FaBullhorn,
  FaPenNib,
  FaVideo,
  FaRobot,
  FaMusic,
  FaBriefcase,
  FaUserTie,
} from "react-icons/fa";

const categories = [
  { label: "Programming & Tech", icon: <FaLaptopCode /> },
  { label: "Graphics & Design", icon: <FaPaintBrush /> },
  { label: "Digital Marketing", icon: <FaBullhorn /> },
  { label: "Writing & Translation", icon: <FaPenNib /> },
  { label: "Video & Animation", icon: <FaVideo /> },
  { label: "AI Services", icon: <FaRobot /> },
  { label: "Music & Audio", icon: <FaMusic /> },
  { label: "Business", icon: <FaBriefcase /> },
  { label: "Consulting", icon: <FaUserTie /> },
];

const PopularCategories = () => {
  return (
    <div className="flex overflow-x-auto gap-4 px-4 py-8 cursor-pointer">
      {categories.map((cat, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-40 h-32 bg-white rounded-xl shadow border border-gray-200 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition"
        >
          <div className="text-2xl text-green-600">{cat.icon}</div>
          <p className="text-center text-sm font-medium text-gray-800">
            {cat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PopularCategories;
