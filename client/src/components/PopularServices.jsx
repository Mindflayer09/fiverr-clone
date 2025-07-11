import React from "react";

const services = [
  {
    label: "Vibe Coding",
    image:
      "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_440,dpr_1.0/v1/attachments/generic_asset/asset/7d48a5ad6cc46b8470eec3fbc6b9e1df-1688624698485/vibe-coding.png",
  },
  {
    label: "Website Development",
    image:
      "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_440,dpr_1.0/v1/attachments/generic_asset/asset/5045a0aa84a9bb94d49b08d94f4e4f20-1687331320131/web-dev.png",
  },
  {
    label: "Video Editing",
    image:
      "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_440,dpr_1.0/v1/attachments/generic_asset/asset/8dcaa25b19c84c4fd5bc44f276bf1b85-1687331478376/video-editing.png",
  },
  {
    label: "Software Development",
    image:
      "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_440,dpr_1.0/v1/attachments/generic_asset/asset/562da6d5ef1d6ab6206c8cc1e53e9f13-1687331841743/software-dev.png",
  },
  {
    label: "SEO",
    image:
      "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_440,dpr_1.0/v1/attachments/generic_asset/asset/562da6d5ef1d6ab6206c8cc1e53e9f13-1687331841743/seo.png",
  },
  {
    label: "Architecture & Interior Design",
    image:
      "https://fiverr-res.cloudinary.com/q_auto,f_auto,w_440,dpr_1.0/v1/attachments/generic_asset/asset/12c62c198a2ac66f4b231d0c693efab4-1687331944984/architecture-design.png",
  },
];

const PopularServices = () => {
  return (
    <div className="px-6 pb-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Popular services</h2>
      <div className="flex overflow-x-auto gap-6">
        {services.map((srv, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-60 bg-green-900 text-white rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-transform"
          >
            <div className="px-4 pt-4 text-lg font-semibold">{srv.label}</div>
            <img src={srv.image} alt={srv.label} className="w-full h-36 object-cover mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularServices;