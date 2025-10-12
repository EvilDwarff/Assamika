import React from 'react';
import Icon1 from '../../assets/img/Icons/advantage1.png';
import Icon2 from '../../assets/img/Icons/advantage2.svg';
import Icon3 from '../../assets/img/Icons/advantage3.svg';
import Icon4 from '../../assets/img/Icons/advantage4.svg';

const Advantages = () => {
  const advantages = [
    {
      icon: Icon1,
      title: 'ТОВАРЫ ИЗ КАЗАХСТАНА',
    },
    {
      icon: Icon2,
      title: 'СЕРТИФИЦИРОВАННЫЕ ПРОДУКТЫ',
    },
    {
      icon: Icon3,
      title: 'БЫСТРАЯ ДОСТАВКА',
    },
    {
      icon: Icon4,
      title: 'ЧЕСТНЫЕ ЦЕНЫ',
    }
  ];

  return (
    <div className="bg-bg-block py-12 md:py-20 shadow-md">
      <div className="container mx-auto px-4">
        <div className="text-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {advantages.map((adv, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 md:gap-4"
            >
              <img 
                src={adv.icon} 
                alt={adv.title} 
                className="w-[32px] h-[32px] object-contain"
              />
              <h3 className="text-sm text-text text-left break-words">
                {adv.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Advantages;