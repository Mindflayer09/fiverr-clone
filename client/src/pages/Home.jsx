import React from "react";
import { FaSearch } from "react-icons/fa";

const categories = [
  "website development",
  "architecture & interior design",
  "UGC videos",
  "video editing",
  "vibe coding",
];

const Home = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url("C:\Users\singh\Downloads\img1.jpeg")`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 text-white px-6 md:px-20 pt-32 pb-20">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
          Our freelancers will take it from here
        </h1>

        {/* Search bar */}
        <div className="mt-8 max-w-2xl">
          <div className="flex items-center bg-white rounded-full shadow-md overflow-hidden">
            <input
              type="text"
              placeholder="Search for any service..."
              className="flex-1 px-6 py-3 text-black focus:outline-none"
            />
            <button className="bg-black px-5 py-3 text-white">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-3 mt-6 max-w-4xl">
          {categories.map((cat, index) => (
            <button
              key={index}
              className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition"
            >
              {cat}
              {cat === "vibe coding" && (
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

export default Home;
