import React from 'react';
import { useNavigate } from 'react-router';

const ProductCard = ({ image, title, price, weight, unit = 'кг', className = '' }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        navigate('/product')
      }}
      className={`group bg-bg-block flex flex-col shadow-md text-center p-2 rounded-none transition-transform duration-300 ease-in-out hover:scale-105 ${className}`}
    >
      {/* Фото */}
      <div className="relative w-full aspect-[4/5] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover sm:object-contain"
        />
      </div>

      {/* Название и блок цены */}
      <div className="px-3 py-4 flex-grow flex flex-col">
        <h3 className="text-sm sm:text-base text-text mb-2 line-clamp-3">
          {title}
        </h3>

        {/* Контейнер для центрирования и сдвига цены + кнопки */}
        <div className="mt-auto relative w-full flex items-center justify-center">
          {/* Цена */}
          <div className="flex items-baseline gap-1 text-sm sm:text-base text-text font-medium transition-transform duration-300 ease-in-out group-hover:-translate-x-5">
            <span>{price} ₽</span>
            {weight && <span className=''>/ {weight} {unit}</span>}
          </div>

          {/* Круглая кнопка «+» */}
          <button
            aria-label="Добавить в корзину"
            onClick={(e) => {
              e.stopPropagation(),
                alert('ff')
            }}
            className="absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[calc(-50%+60px)] flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xl leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-dark focus:outline-none"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;