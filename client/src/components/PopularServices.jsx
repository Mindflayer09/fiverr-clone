import React from "react";

const services = [
  {
    label: "Vibe Coding",
    image: "/services/vibe-coding.jpg",
  },
  {
    label: "Website Development",
    image: "/services/web-dev.jpg",
  },
  {
    label: "Video Editing",
    image: "/services/video-editing.jpg",
  },
  {
    label: "Software Development",
    image: "/services/software-dev.jpg",
  },
  {
    label: "SEO",
    image: "/services/seo.jpg",
  },
  {
    label: "Architecture & Interior Design",
    image: "/services/architecture-design.jpg",
  },
];

const PopularServices = () => {
  return (
    <section className="px-6 md:px-20 py-12 bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-left">
        Popular Services
      </h2>

      <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md min-w-[240px] w-60 flex-shrink-0 hover:shadow-lg border transition-transform duration-300 transform hover:-translate-y-1"
          >
            <img
              src={service.image}
              alt={service.label}
              className="w-full h-36 object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h3 className="text-md font-semibold text-gray-800 text-center">
                {service.label}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularServices;
