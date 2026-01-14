import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@components/admin/common/AdminLayout';
import { apiUrl, apiPhoto, adminToken } from '@components/common/http';

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

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

  // server images: [{id,image}]
  const [images, setImages] = useState([]);
  const [defaultImage, setDefaultImage] = useState(null);

  // temp images to add
  const [tempImages, setTempImages] = useState([]); // [{id,name, previewUrl}]

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${apiUrl}/admin/products/${id}`, { headers: { Authorization: `Bearer ${adminToken()}` } }),
        fetch(`${apiUrl}/admin/categories`, { headers: { Authorization: `Bearer ${adminToken()}` } }),
      ]);

      const pData = await pRes.json();
      const cData = await cRes.json();

      const p = pData.data;

      setCategories(cData.data || []);
      setForm({
        category_id: String(p.category_id || ''),
        name: p.name || '',
        description: p.description || '',
        price: p.price ?? '',
        discount_price: p.discount_price ?? '',
        weight: p.weight || '',
        reserve: p.reserve ?? 0,
        sold_count: p.sold_count ?? 0,
        status: p.status || 'inactive',
      });

      setImages(p.images || []);
      setDefaultImage(p.image || null);
    } catch (e) {
      console.error(e);
      setErrors({ global: 'Ошибка загрузки товара' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Название обязательно';
    if (!form.category_id) e.category_id = 'Категория обязательна';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Цена обязательна';
    return e;
  };

  const activeCats = useMemo(
    () => categories.filter((c) => c.status === 1 || c.status === true),
    [categories]
  );

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

  const addImagesToProduct = async () => {
    if (!tempImages.length) return;

    try {
      const res = await fetch(`${apiUrl}/admin/products/${id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify({ gallery: tempImages.map((t) => t.id) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.message || 'Ошибка при добавлении фото' });
        return;
      }

      // Перечитаем товар (чтобы взять свежие images и default)
      await fetchAll();
      setTempImages([]);
    } catch (e) {
      setErrors({ global: 'Ошибка соединения при добавлении фото' });
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Удалить фото?')) return;
    try {
      const res = await fetch(`${apiUrl}/admin/product-images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      if (!res.ok) throw new Error();

      // оптимистично
      setImages((prev) => prev.filter((x) => x.id !== imageId));
      // если удаляли дефолт, лучше перечитать
      await fetchAll();
    } catch (e) {
      setErrors({ global: 'Ошибка при удалении фото' });
    }
  };

  const makeDefault = async (filename) => {
    try {
      const res = await fetch(`${apiUrl}/admin/products/${id}/default-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify({ image: filename }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.message || 'Ошибка при установке главной' });
        return;
      }
      setDefaultImage(filename);
    } catch (e) {
      setErrors({ global: 'Ошибка соединения' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        price: Number(form.price),
        discount_price: form.discount_price === '' ? null : Number(form.discount_price),
        reserve: Number(form.reserve || 0),
        sold_count: Number(form.sold_count || 0),
      };

      const res = await fetch(`${apiUrl}/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ global: data.message || 'Ошибка при сохранении' });
        return;
      }

      navigate('/admin/products');
    } catch (e) {
      setErrors({ global: 'Ошибка соединения с сервером' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-center mt-10">Загрузка...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-[var(--color-bg-base)] min-h-screen flex justify-center">
        <div className="w-full max-w-4xl space-y-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--color-bg-block)] rounded-xl shadow-lg p-6 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="title">Редактировать товар</h1>
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>

            {errors.global && <p className="text-red-600 text-sm">{errors.global}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* name */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Название</label>
                <input
                  value={form.name}
                  onChange={onChange('name')}
                  className={`bg-base border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500
                  ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* category */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Категория</label>
                <select
                  value={form.category_id}
                  onChange={onChange('category_id')}
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
                  className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* weight */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Вес</label>
                <input
                  value={form.weight}
                  onChange={onChange('weight')}
                  className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              />
            </div>
          </form>

          {/* Gallery block */}
          <div className="bg-[var(--color-bg-block)] rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-gray-900">Галерея</div>
                <div className="text-sm text-gray-600">Главная отмечена рамкой</div>
              </div>

              <label className="btn btn-primary w-full sm:w-auto text-center cursor-pointer">
                {uploading ? 'Загрузка...' : '+ Загрузить фото'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadTempImages(e.target.files)}
                />
              </label>
            </div>

            {/* temp preview + add */}
            {tempImages.length > 0 && (
              <div className="bg-[var(--color-bg-base)] rounded-xl p-4 border border-[var(--color-border-light)]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="text-sm text-gray-700">
                    Новые фото: <span className="font-medium">{tempImages.length}</span>
                  </div>
                  <button type="button" onClick={addImagesToProduct} className="btn btn-primary">
                    Добавить к товару
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {tempImages.map((img) => (
                    <div key={img.id} className="rounded-xl overflow-hidden bg-gray-100">
                      <img src={img.previewUrl} alt="" className="w-full h-24 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* existing images */}
            {images.length === 0 ? (
              <p className="text-sm text-gray-500">Фотографий пока нет</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img) => {
                  const isDefault = defaultImage === img.image;
                  return (
                    <div
                      key={img.id}
                      className={`relative group rounded-xl overflow-hidden bg-gray-100 border-2 ${isDefault ? 'border-orange-500' : 'border-transparent'
                        }`}
                      title={isDefault ? 'Главная' : ''}
                    >
                      <img
                        src={`${apiPhoto}/${img.image}`}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=no+image';
                        }}
                      />

                      <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => makeDefault(img.image)}
                          className="flex-1 bg-white/90 hover:bg-white text-gray-800 rounded-lg px-2 py-1 text-xs shadow"
                        >
                          Главная
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteImage(img.id)}
                          className="bg-white/90 hover:bg-white text-red-600 rounded-lg px-2 py-1 text-xs shadow"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/admin/products')}
            className="btn w-full border border-gray-300 bg-white"
            type="button"
          >
            Назад к списку
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Edit;
