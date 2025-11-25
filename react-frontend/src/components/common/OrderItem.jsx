import React from 'react'

const OrderItem = ({ item }) => {
  return (
       <div className="flex items-start gap-4 py-4 border-b border-[var(--color-border-light)]">
        {/* Изображение */}
        <div className="flex-shrink-0">
            <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 object-contain"
            />
        </div>

        {/* Информация о товаре */}
        <div className="flex-1 flex flex-col justify-center">
            <p className="text-base text-[var(--color-text)] leading-snug">
                {item.title}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{item.weight}</p>
        </div>

        {/* Количество и Цена */}
        <div className="flex flex-col items-end text-right min-w-[100px]">
            <div className="text-base text-gray-600 mb-1">
                Кол-во: {item.quantity}
            </div>
            <div className="text-base font-medium text-[var(--color-text)]">
                {item.price * item.quantity} ₽
            </div>
        </div>
    </div>
  )
}

export default OrderItem