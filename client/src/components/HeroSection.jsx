import React from "react";
import { FaSearch } from "react-icons/fa";

const categories = [
  "Web Development",
  "Graphic Design",
  "Digital Marketing",
  "Video Editing",
  "Voice Over",
  "AI Services",
  "Logo Design",
  "Content Writing",
];

const HeroSection = () => {
  return (
    <div
      className="min-h-[85vh] w-full bg-cover bg-center relative"
      style={{
        backgroundImage: `url("/images/bg.jpg")`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-20 pt-36 pb-24 text-white">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl">
          Find the right freelance service, right away
        </h1>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl">
          <div className="flex items-center bg-white rounded-full overflow-hidden shadow-md">
            <input
              type="text"
              placeholder="Try 'logo design'"
              className="flex-1 px-6 py-3 text-black placeholder-gray-400 focus:outline-none"
            />
            <button className="bg-green-600 px-6 py-3 hover:bg-green-700 transition text-white">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-3 mt-6 max-w-4xl">
          {categories.map((cat, index) => (
            <button
              key={index}
              className="bg-white/20 border border-white/30 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition duration-200"
            >
              {cat}
              {cat === "AI Services" && (
                <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
