import React, { useState } from 'react';
import ProductCard from './common/ProductCard';
import teaImg1 from '../assets/img/products/image1.webp';
import teaImg2 from '../assets/img/products/image2.webp';
import teaImg3 from '../assets/img/products/image3.webp';
import Header from './common/Header';
import Footer from './common/Footer';

const CatalogPage = () => {
    const [selectedCategories, setSelectedCategories] = useState(['Конфеты']);
    const [selectedSort, setSelectedSort] = useState(['Популярные']);
    const [showCategories, setShowCategories] = useState(true);
    const [showSort, setShowSort] = useState(true);

    const categories = ['Мука', 'Чай', 'Макароны', 'Конфеты'];
    const sorts = ['Дешевые', 'Дорогие', 'Новинки', 'Популярные'];

    const toggleCategory = (name) => {
        setSelectedCategories((prev) =>
            prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
        );
    };

    const toggleSort = (name) => {
        setSelectedSort((prev) =>
            prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
        );
    };

    const products = [
        { id: 1, image: teaImg1, title: 'Ceylon Ginger', price: 485, weight: 50, unit: 'g' },
        { id: 2, image: teaImg2, title: 'Cinnamon Chai Tea', price: 485, weight: 50, unit: 'g' },
        { id: 3, image: teaImg3, title: 'Black Assam Tea', price: 485, weight: 50, unit: 'g' },
        { id: 4, image: teaImg1, title: 'Ceylon Ginger', price: 485, weight: 50, unit: 'g' },
        { id: 5, image: teaImg2, title: 'Cinnamon Chai Tea', price: 485, weight: 50, unit: 'g' },
        { id: 6, image: teaImg3, title: 'Black Assam Tea', price: 485, weight: 50, unit: 'g' },
    ];

    return (
        <>
            <Header />
            <section className="bg-bg-block pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Контейнер: фильтры + карточки */}
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Левая панель — фильтры */}
                        <aside className="w-full lg:w-1/4">
                            {/* Категории */}
                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCategories(!showCategories)}
                                    className="flex w-full items-center justify-between text-lg font-medium text-text mb-4"
                                >
                                    Категории
                                    <span className="text-text text-xl leading-none">
                                        {showCategories ? '–' : '+'}
                                    </span>
                                </button>

                                <ul
                                    className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ${showCategories ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    {categories.map((cat) => (
                                        <li key={cat} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={cat}
                                                checked={selectedCategories.includes(cat)}
                                                onChange={() => toggleCategory(cat)}
                                                className="accent-orange-600 w-4 h-4"
                                            />
                                            <label htmlFor={cat} className="text-text text-sm">
                                                {cat}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Сортировка */}
                            <div className="mt-4 py-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSort(!showSort)}
                                    className="flex w-full items-center justify-between text-lg font-medium text-text mb-4"
                                >
                                    Сортировать
                                    <span className="text-text text-xl leading-none">
                                        {showSort ? '–' : '+'}
                                    </span>
                                </button>

                                <ul
                                    className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ${showSort ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    {sorts.map((sort) => (
                                        <li key={sort} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={sort}
                                                checked={selectedSort.includes(sort)}
                                                onChange={() => toggleSort(sort)}
                                                className="accent-orange-600 w-4 h-4"
                                            />
                                            <label htmlFor={sort} className="text-text text-sm">
                                                {sort}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>

                        {/* Правая часть — карточки */}
                        <div className="w-full lg:w-3/4">
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default CatalogPage;
