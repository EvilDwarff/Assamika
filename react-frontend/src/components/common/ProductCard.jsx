import React from 'react';

const ProductCard = ({ image, title, price, weight, unit = 'кг', className = '' }) => {
  return (
    <div
      className={`bg-bg-block flex flex-col shadow-md text-center p-2 rounded-none ${className}`}
    >
      {/* Фото */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover sm:object-contain"
        />
      </div>

      {/* Название и Цена/Вес */}
      <div className="px-3 py-4 flex-grow flex flex-col justify-between">
        <h3 className="text-sm sm:text-base text-text mb-2 line-clamp-3">
          {title}
        </h3>

        <div className="flex items-center justify-center gap-1 text-sm sm:text-base text-text font-medium">
          <span>{price} ₽</span>
          {weight && <span>/ {weight} {unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
