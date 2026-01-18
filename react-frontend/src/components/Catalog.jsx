import React, { useEffect, useMemo, useState } from 'react';
import Layout from './common/Layout';
import ProductCard from './common/ProductCard';
import { apiUrl, apiPhoto } from '@components/common/http';

const CatalogPage = () => {
    const [categories, setCategories] = useState([]); // [{id,name,products_count}]
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [sort, setSort] = useState('popular'); // popular|new|cheap|expensive
    const [products, setProducts] = useState([]);

    const [showCategories, setShowCategories] = useState(true);
    const [showSort, setShowSort] = useState(true);

    // загрузка категорий
    useEffect(() => {
        (async () => {
            const res = await fetch(`${apiUrl}/categories`);
            const data = await res.json();
            setCategories(data.data || []);
        })();
    }, []);

    // загрузка товаров (с фильтрами)
    useEffect(() => {
        (async () => {
            const qs = new URLSearchParams();
            if (selectedCategoryIds.length) qs.set('categories', selectedCategoryIds.join(','));
            qs.set('sort', sort);

            const res = await fetch(`${apiUrl}/products?${qs.toString()}`);
            const data = await res.json();
            setProducts(data.data || []);
        })();
    }, [selectedCategoryIds, sort]);

    const toggleCategory = (id) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    return (
        <Layout>
            <section className="pt-4 md:pt-8 lg:pt-12 pb-8 md:pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-10">
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

                                <ul className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ${showCategories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {categories.map((cat) => (
                                        <li key={cat.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`cat-${cat.id}`}
                                                checked={selectedCategoryIds.includes(cat.id)}
                                                onChange={() => toggleCategory(cat.id)}
                                                className="accent-orange-600 w-4 h-4"
                                            />
                                            <label htmlFor={`cat-${cat.id}`} className="text-text text-sm">
                                                {cat.name}
                                                {typeof cat.products_count === 'number' ? (
                                                    <span className="text-gray-500"> ({cat.products_count})</span>
                                                ) : null}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Сортировка (лучше radio) */}
                            <div className="mt-4 py-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSort(!showSort)}
                                    className="flex w-full items-center justify-between text-lg font-medium text-text mb-4"
                                >
                                    Сортировка
                                    <span className="text-text text-xl leading-none">
                                        {showSort ? '–' : '+'}
                                    </span>
                                </button>

                                <div className={`flex flex-col gap-2 overflow-hidden transition-all duration-300 ${showSort ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {[
                                        { id: 'cheap', label: 'Дешевые' },
                                        { id: 'expensive', label: 'Дорогие' },
                                        { id: 'new', label: 'Новинки' },
                                        { id: 'popular', label: 'Популярные' },
                                    ].map((s) => (
                                        <label key={s.id} className="flex items-center gap-2 text-sm text-text">
                                            <input
                                                type="radio"
                                                name="sort"
                                                value={s.id}
                                                checked={sort === s.id}
                                                onChange={() => setSort(s.id)}
                                                className="accent-orange-600 w-4 h-4"
                                            />
                                            {s.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Товары */}
                        <div className="w-full lg:w-3/4">
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                {products.map((p) => (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        image={p.image ? `${apiPhoto}/${p.image}` : null}
                                        title={p.name}
                                        price={p.price}                       
                                        discount_price={p.discount_price}     
                                        weight={p.weight}
                                        soldOut={p.status === 'sold_out' || Number(p.reserve) <= 0}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default CatalogPage;
