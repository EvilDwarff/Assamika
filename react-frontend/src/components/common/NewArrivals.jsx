import React from 'react';
import ProductCard from './ProductCard';
import Image1 from '../../assets/img/products/image1.webp';
import Image2 from '../../assets/img/products/image2.webp';
import Image3 from '../../assets/img/products/image3.webp';
import Image4 from '../../assets/img/products/image4.webp';

const NewArrivals = () => {
  const products = [
    {
      id: 1,
      image: Image1,
      title: 'Чай индийский гранулированный "Assam"',
      price: 968,
      weight: 1,
      unit: 'кг',
    },
    {
      id: 2,
      image: Image2,
      title: 'Мука пшеничная "Классик", высший сорт',
      price: 564,
      weight: 5,
      unit: 'кг',
    },
    {
      id: 3,
      image: Image3,
      title: 'Чай кенийский "Симба", гранулированный',
      price: 890,
      weight: 1,
      unit: 'кг',
    },
    {
      id: 4,
      image: Image4,
      title: 'Чай индийский гранулированный "NAYRYZ"',
      price: 258,
      weight: 250,
      unit: 'гр',
    },
  ];

  return (
    <div className="container py-12 md:py-20 mx-auto px-2">
      <h1 className="title text-center mb-6">Новинки</h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            title={product.title}
            price={product.price}
            weight={product.weight}
            unit={product.unit}
          />
        ))}
      </div>
    </div>
  );
};

export default NewArrivals;
