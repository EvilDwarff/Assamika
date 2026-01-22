import React, { useEffect } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from '@components/Home';
import CatalogPage from '@components/Catalog';
import CheckoutPage from '@components/CheckoutPage';
import ProductPage from '@components/ProductPage';
import CartPage from '@components/CartPage';
const Login = lazy(() => import("@components/admin/Login"));
const Dashboard = lazy(() => import("@components/admin/Dashboard"));
import { ToastContainer } from 'react-toastify';
import { AdminRequireAuth } from '@components/admin/AdminRequireAuth';
import LoginUser from './components/LoginUser';
import RegisterUser from './components/RegisterUser';
import { RequireAuth } from './components/RequireAuth';
import Profile from './components/Profile';
import OrderDetails from './components/OrderDetails';
import OrdersHistory from './components/OrdersHistory';
const ShowCategories = lazy(() => import("@components/admin/categories/Show"));
const CreateCategory = lazy(() => import("@components/admin/categories/Create"));
const EditCategory = lazy(() => import("@components/admin/categories/Edit"));
const ShowProducts = lazy(() => import("@components/admin/products/Show"));
const CreateProduct = lazy(() => import("@components/admin/products/Create"));
const EditProduct = lazy(() => import("@components/admin/products/Edit"));

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
          <Route path="/product/:id" element={<ProductPage />} />

          <Route path='/admin/login' element={<Login />} />
          <Route path='/account/login' element={<LoginUser />} />
          <Route path='/account/register' element={<RegisterUser />} />

          <Route path='/account' element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          } />


          <Route path='/cart' element={
            <RequireAuth>
              <CartPage />
            </RequireAuth>
          } />

          <Route path='/checkout' element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          } />
        

          <Route path='/orders' element={
            <RequireAuth>
              <OrdersHistory />
            </RequireAuth>
          } />


          <Route path='/orders/:id' element={
            <RequireAuth>
              <OrderDetails />
            </RequireAuth>
          } />


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

          <Route
            path="/admin/products"
            element={
              <AdminRequireAuth>
                <Suspense
                  fallback={<div className="sm:my-10 lg:my-20">Загрузка...</div>}
                >
                  <ShowProducts />
                </Suspense>
              </AdminRequireAuth>
            }
          />

          <Route
            path="/admin/products/create"
            element={
              <AdminRequireAuth>
                <Suspense
                  fallback={<div className="sm:my-10 lg:my-20">Загрузка...</div>}
                >
                  <CreateProduct />
                </Suspense>
              </AdminRequireAuth>
            }
          />

          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminRequireAuth>
                <Suspense
                  fallback={<div className="sm:my-10 lg:my-20">Загрузка...</div>}
                >
                  <EditProduct />
                </Suspense>
              </AdminRequireAuth>
            }
          />

        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  )
}

export default App
