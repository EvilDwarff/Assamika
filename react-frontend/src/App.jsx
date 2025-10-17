import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import CatalogPage from './components/Catalog';

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
           <Route path='/' element={<Home />} />
           <Route path='/catalog' element={<CatalogPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
