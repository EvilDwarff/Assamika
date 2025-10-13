import React from 'react';
import Icon1 from '../../assets/img/Icons/advantage1.png';
import Icon2 from '../../assets/img/Icons/advantage2.svg';
import Icon3 from '../../assets/img/Icons/advantage3.svg';
import Icon4 from '../../assets/img/Icons/advantage4.svg';

const Advantages = () => {
  const advantages = [
    { icon: Icon1, title: 'ТОВАРЫ ИЗ КАЗАХСТАНА' },
    { icon: Icon2, title: 'СЕРТИФИЦИРОВАННЫЕ ПРОДУКТЫ' },
    { icon: Icon3, title: 'БЫСТРАЯ ДОСТАВКА' },
    { icon: Icon4, title: 'ЧЕСТНЫЕ ЦЕНЫ' },
  ];

  return (
    <section className="bg-bg-block py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Сетка */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {advantages.map((adv, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-3 md:gap-4 w-full"
            >
              <img
                src={adv.icon}
                alt={adv.title}
                className="w-10 h-10 object-contain"
              />
              <h3 className="text-sm sm:text-base text-text font-medium leading-snug">
                {adv.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
