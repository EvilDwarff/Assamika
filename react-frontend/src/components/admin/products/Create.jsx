import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@components/admin/common/AdminLayout';
import { apiUrl, adminToken } from '@components/common/http';

const Create = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    discount_price: '',
    weight: '',
    reserve: 0,
    sold_count: 0,
    status: 'inactive',
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  // temp images
  const [tempImages, setTempImages] = useState([]); // [{id,name, previewUrl}]

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await fetch(`${apiUrl}/admin/categories`, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      const data = await res.json();
      setCategories(data.data || []);
      // выставим дефолт если пусто
      if ((data.data || []).length && !form.category_id) {
        setForm((p) => ({ ...p, category_id: String(data.data[0].id) }));
      }
    } catch (e) {
      console.error('Ошибка при загрузке категорий:', e);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Название обязательно';
    if (!form.category_id) e.category_id = 'Категория обязательна';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Цена обязательна';
    if (form.discount_price !== '' && Number(form.discount_price) < 0) e.discount_price = 'Некорректная скидка';
    if (!['inactive', 'in_stock', 'sold_out'].includes(form.status)) e.status = 'Некорректный статус';
    return e;
  };

  const uploadTempImages = async (files) => {
    if (!files?.length) return;

    setUploading(true);
    try {
      const fd = new FormData();
      [...files].forEach((f) => fd.append('images[]', f));

      const res = await fetch(`${apiUrl}/admin/temp-images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken()}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors((p) => ({ ...p, global: 'Ошибка загрузки изображений' }));
        return;
      }

      const saved = (data.data || []).map((t, idx) => ({
        id: t.id,
        name: t.name,
        previewUrl: URL.createObjectURL(files[idx] || files[0]),
      }));

      setTempImages((prev) => [...prev, ...saved]);
    } catch (e) {
      console.error(e);
      setErrors((p) => ({ ...p, global: 'Ошибка соединения при загрузке' }));
    } finally {
      setUploading(false);
    }
  };

  const removeTempLocal = (id) => {
    setTempImages((prev) => prev.filter((x) => x.id !== id));
    // если хочешь — можешь ещё дергать DELETE /admin/temp-images/{id}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
        discount_price: form.discount_price === '' ? null : Number(form.discount_price),
        reserve: Number(form.reserve || 0),
        sold_count: Number(form.sold_count || 0),
        gallery: tempImages.map((t) => t.id),
      };

      const res = await fetch(`${apiUrl}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.message || 'Ошибка при создании товара' });
        return;
      }

      navigate('/admin/products');
    } catch (err) {
      setErrors({ global: 'Ошибка соединения с сервером' });
    }
  };

  const activeCats = useMemo(
    () => categories.filter((c) => c.status === 1 || c.status === true),
    [categories]
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-[var(--color-bg-base)] min-h-screen flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-bg-block)] w-full max-w-3xl rounded-xl shadow-lg p-6 space-y-5"
        >
          <h1 className="title text-center">Создать товар</h1>

          {errors.global && <p className="text-red-600 text-sm text-center">{errors.global}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Название</label>
              <input
                value={form.name}
                onChange={onChange('name')}
                className={`bg-base border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500
                ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Введите название..."
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* category */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Категория</label>
              <select
                value={form.category_id}
                onChange={onChange('category_id')}
                disabled={loadingCats}
                className={`w-full py-2 pl-3 pr-10 text-gray-700 bg-base border rounded-md shadow-sm appearance-none
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer
                ${errors.category_id ? 'border-red-500' : 'border-gray-300'}`}
              >
                {activeCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
            </div>

            {/* price */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Цена</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={onChange('price')}
                className={`bg-base border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500
                ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* discount */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Цена со скидкой</label>
              <input
                type="number"
                step="0.01"
                value={form.discount_price}
                onChange={onChange('discount_price')}
                className={`bg-base border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500
                ${errors.discount_price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.discount_price && <p className="text-red-500 text-xs mt-1">{errors.discount_price}</p>}
            </div>

            {/* weight */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Вес (строка)</label>
              <input
                value={form.weight}
                onChange={onChange('weight')}
                className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Напр. 500г / 1кг"
              />
            </div>

            {/* reserve */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Остаток</label>
              <input
                type="number"
                value={form.reserve}
                onChange={onChange('reserve')}
                className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* sold_count */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Продано</label>
              <input
                type="number"
                value={form.sold_count}
                onChange={onChange('sold_count')}
                className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* status */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Статус</label>
              <select
                value={form.status}
                onChange={onChange('status')}
                className="w-full py-2 pl-3 pr-10 text-gray-700 bg-base border border-gray-300 rounded-md shadow-sm 
                appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
              >
                <option value="inactive">Неактивен</option>
                <option value="in_stock">В наличии</option>
                <option value="sold_out">Нет в наличии</option>
              </select>
            </div>
          </div>

          {/* description */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Описание</label>
            <textarea
              value={form.description}
              onChange={onChange('description')}
              className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
              placeholder="Описание товара..."
            />
          </div>

          {/* images */}
          <div className="bg-[var(--color-bg-base)] rounded-xl p-4 border border-[var(--color-border-light)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <div className="font-semibold text-gray-900">Фотографии</div>
                <div className="text-sm text-gray-600">Можно выбрать несколько файлов</div>
              </div>

              <label className="btn btn-primary w-full sm:w-auto text-center cursor-pointer">
                {uploading ? 'Загрузка...' : '+ Добавить фото'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadTempImages(e.target.files)}
                />
              </label>
            </div>

            {tempImages.length === 0 ? (
              <p className="text-sm text-gray-500">Фото не добавлены</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tempImages.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={img.previewUrl}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeTempLocal(img.id)}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-lg px-2 py-1 text-xs shadow opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                      title="Убрать"
                    >
                      удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full btn btn-primary mt-2">
            Создать
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Create;
