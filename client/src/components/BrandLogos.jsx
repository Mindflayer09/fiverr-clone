import React from "react";

const logos = [
  { name: "Facebook", src: "/logos/facebook.svg" },
  { name: "Google", src: "/logos/google.svg" },
  { name: "Netflix", src: "/logos/netflix.svg" },
  { name: "PayPal", src: "/logos/paypal.svg" },
  { name: "Payoneer", src: "/logos/payoneer.svg" },
];

const BrandLogos = () => {
  return (
    <section className="bg-white py-6 border-t border-b">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center items-center gap-8 opacity-70">
        {logos.map((logo, idx) => (
          <img
            key={idx}
            src={logo.src}
            alt={logo.name}
            className="h-8 w-auto grayscale hover:grayscale-0 transition duration-300"
          />
        ))}
      </div>
    </section>
  );
};

export default BrandLogos;
