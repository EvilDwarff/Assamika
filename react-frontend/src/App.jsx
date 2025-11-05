import React, { useEffect } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from '@components/Home';
import CatalogPage from '@components/Catalog';
import ProductPage from '@components/ProductPage';
import CartPage from '@components/CartPage';
const Login = lazy(() => import("@components/admin/Login"));
const Dashboard = lazy(() => import("@components/admin/Dashboard"));
import { ToastContainer } from 'react-toastify';
import { AdminRequireAuth } from '@components/admin/AdminRequireAuth';
const ShowCategories = lazy(() => import("@components/admin/categories/Show"));
const CreateCategory = lazy(() => import("@components/admin/categories/Create"));
const EditCategory = lazy(() => import("@components/admin/categories/Edit"));

function App() {

  const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  };
  return (
    <>


      <BrowserRouter>
        <ScrollToTop />
        <Routes>

          <Route path='/' element={<Home />} />
          <Route path='/catalog' element={<CatalogPage />} />
          <Route path='/product' element={<ProductPage />} />
          <Route path='/cart' element={<CartPage />} />
          <Route path='/admin/login' element={<Login />} />







          {/* Admin Routs */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRequireAuth>
                <Suspense
                  fallback={
                    <div className="sm:my-10 lg:my-20">
                      Загрузка...
                    </div>
                  }
                >
                  <Dashboard />
                </Suspense>
              </AdminRequireAuth>

            }
          />

          <Route path='/admin/categories' element={
            <AdminRequireAuth>
              <Suspense
                fallback={
                  <div className="sm:my-10 lg:my-20">
                    Загрузка...
                  </div>
                }>
                <ShowCategories />
              </Suspense>
            </AdminRequireAuth>
          } />

          <Route path='/admin/categories/create' element={
            <AdminRequireAuth>
              <Suspense
                fallback={
                  <div className="sm:my-10 lg:my-20">
                    Загрузка...
                  </div>
                }>
                <CreateCategory />
              </Suspense>
            </AdminRequireAuth>
          } />

          <Route path='/admin/categories/edit/:id' element={
            <AdminRequireAuth>
              <Suspense
                fallback={
                  <div className="sm:my-10 lg:my-20">
                    Загрузка...
                  </div>
                }>
                <EditCategory />
              </Suspense>
            </AdminRequireAuth>
          } />

        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  )
}

export default App
