
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "./common/Hero";
import Advantages from "./common/Advantage";
import NewArrivals from "./common/NewArrivals";
import NewsLetter from "./common/NewsLetter";
import Suppliers from "./common/Suppliers";
import Layout from "./common/Layout";

const Home = () => {
    const location = useLocation();

    useEffect(() => {
        const scrollToAnchor = () => {
            const { hash } = location;
            if (hash) {
                const element = document.querySelector(hash);
                if (element) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            element.scrollIntoView({ behavior: "smooth" });
                            window.history.replaceState(
                                null,
                                "",
                                window.location.pathname + window.location.search
                            );
                        });
                    });
                }
            }
        };

        scrollToAnchor();
    }, [location]);



    return (
        <Layout>
            <Hero />
            <Advantages />
            <NewArrivals />
            <NewsLetter />
            <Suppliers />
        </Layout>
    )
}

export default Home