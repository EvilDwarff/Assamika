import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiUrl, userToken } from '@components/common/http';

const ProductCard = ({
  id,
  image,
  title,
  price,
  discount_price,
  weight,
  soldOut = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const hasDiscount =
    discount_price !== null &&
    discount_price !== undefined &&
    discount_price !== '' &&
    Number(discount_price) > 0 &&
    Number(discount_price) < Number(price);

  const finalPrice = hasDiscount ? discount_price : price;

  const discountPercent = hasDiscount
    ? Math.round(((Number(price) - Number(discount_price)) / Number(price)) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    const token = userToken();
    if (!token) {
      toast.error('Нужно войти, чтобы добавить в корзину');
      // navigate('/login'); // если хочешь сразу отправлять на логин
      return;
    }

    try {
      setAdding(true);

      const res = await fetch(`${apiUrl}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: Number(id), qty: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Ошибка добавления в корзину');
      }

      toast.success('Добавлено в корзину');
    } catch (err) {
      toast.error(err.message || 'Ошибка');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${id}`)}
      className={`group bg-bg-block flex flex-col shadow-md text-center p-2 transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer ${className}`}
    >
      {/* Фото */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
        <img src={image} alt={title} className="w-full h-full object-contain" />

        {/* Бейдж распродано */}
        {soldOut && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            Распродано
          </div>
        )}

        {/* Бейдж скидки */}
        {hasDiscount && !soldOut && (
          <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded font-semibold">
            −{discountPercent}%
          </div>
        )}
      </div>

      {/* Название и цена */}
      <div className="px-3 py-4 flex-grow flex flex-col">
        <h3 className="text-sm sm:text-base text-text mb-2 line-clamp-3">{title}</h3>

        <div className="mt-auto relative w-full flex items-center justify-center">
          {/* Цена */}
          <div className="flex flex-col items-center text-sm sm:text-base text-text font-medium transition-transform duration-300 ease-in-out group-hover:-translate-x-5">
            {hasDiscount ? (
              <>
                <span className="text-orange-700 font-semibold">{finalPrice} ₽</span>
                <span className="text-gray-400 line-through text-xs">{price} ₽</span>
              </>
            ) : (
              <span>{price} ₽</span>
            )}

            {weight && <span className="text-xs text-gray-500">{weight}</span>}
          </div>

          {/* Кнопка + */}
          {!soldOut && (
            <button
              aria-label="Добавить в корзину"
              onClick={handleAddToCart}
              disabled={adding}
              className="absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[calc(-50%+60px)]
                flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xl
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-dark
                disabled:opacity-60"
              title="Добавить в корзину"
            >
              {adding ? '…' : '+'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
