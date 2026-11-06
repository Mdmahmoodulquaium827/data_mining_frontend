"use client";

import { useState } from "react";

export default function ProductGallery({ images, title }) {
  const [selectedImage, setSelectedImage] = useState(
    images?.[0] || ""
  );

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center">
        No image available
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Main Image */}
      <div className="bg-gray-100 rounded-2xl h-[300px] sm:h-[400px] md:h-[480px] flex items-center justify-center overflow-hidden">

        <img
          src={selectedImage}
          alt={title}
          className="w-full h-full object-contain p-5"
        />

      </div>

      {/* Image Thumbnails */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">

        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`bg-gray-100 rounded-xl h-20 sm:h-24 overflow-hidden border-2 transition
              ${
                selectedImage === image
                  ? "border-black"
                  : "border-transparent hover:border-gray-400"
              }`}
          >

            <img
              src={image}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-contain p-2"
            />

          </button>
        ))}

      </div>

    </div>
  );
}