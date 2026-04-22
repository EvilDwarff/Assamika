// components/pages/NewArrivals.jsx
import React, { useEffect, useState } from 'react';

import ProductCard from '@components/common/ProductCard';
import { apiUrl, apiPhoto } from '@components/common/http';

const NewArrivals = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewest = async () => {
            try {
                // Вариант 1: отдельный эндпоинт /api/products/newest
                const res = await fetch(`${apiUrl}/products/newest`);
                
    
                
                if (!res.ok) throw new Error('Ошибка загрузки');
                
                const data = await res.json();
                setProducts(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNewest();
    }, []);

    if (loading) {
        return (
          
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4 text-center text-text">
                        Загрузка...
                    </div>
                </section>
          
        );
    }

    if (error) {
        return (
           
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4 text-center text-red-500">
                        Ошибка: {error}
                    </div>
                </section>
        
        );
    }

    return (
       
            <section id="news" className="py-12 md:py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="title text-center mb-6 md:mb-8">Новинки</h1>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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

                    {products.length === 0 && (
                        <p className="text-center text-text mt-8">Новинок пока нет</p>
                    )}
                </div>
            </section>
       
    );
};

export default NewArrivals;