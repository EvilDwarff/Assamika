
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./common/Header";
import Hero from "./common/Hero";
import Advantages from "./common/Advantage";

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
        <>
       <Header />
       <Hero />
       <Advantages />
       </>
    )
}

export default Home