import React from "react";
import HeroSection from "../components/HeroSection";
import PopularCategories from "../components/PopularCategories";
import PopularServices from "../components/PopularServices";
import BrandLogos from "../components/BrandLogos";

const Home = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section with background image */}
      <HeroSection />
     

      {/* Trusted Brands Section */}
      <section className="bg-white py-8 px-6 md:px-20 text-center border-t">
        <h2 className="text-sm uppercase tracking-widest text-gray-600 mb-4">
          Trusted by:
        </h2>
        <div className="flex justify-center items-center gap-6 flex-wrap opacity-70">
          <BrandLogos />
        </div>
      </section>
      {/* Popular Categories */}
      <PopularCategories />

      {/* Popular Services */}
      <PopularServices />
    </div>
  );
};

export default Home;
