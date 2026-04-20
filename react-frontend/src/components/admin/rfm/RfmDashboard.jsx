import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from '@components/admin/common/AdminLayout';
import { apiUrl, adminToken } from "@components/common/http";

// === Утилиты форматирования ===
const fmtMoney = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// === Цветовая шкала для скоринга 1-5 ===
const scoreColor = (score, type = 'r') => {
  const colors = {
    5: 'bg-emerald-500',
    4: 'bg-lime-500',
    3: 'bg-yellow-400',
    2: 'bg-orange-400',
    1: 'bg-red-500',
  };
  return colors[score] || 'bg-gray-300';
};

const scoreLabel = (score) => {
  const labels = { 5: 'Отлично', 4: 'Хорошо', 3: 'Средне', 2: 'Плохо', 1: 'Критично' };
  return labels[score] || '-';
};

// === Интерпретация сегментов ===
const getSegmentInfo = (segment) => {
  if (!segment || segment.length !== 3) return { label: 'Обычные', color: 'text-gray-600', bg: 'bg-gray-50' };

  const [r, f, m] = segment.split('').map(Number);

  if (r >= 4 && f >= 4 && m >= 4) return { label: 'Чемпионы', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (r >= 4 && f >= 3) return { label: 'Лояльные', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (f >= 4 && m >= 4) return { label: 'Крупные покупатели', color: 'text-purple-600', bg: 'bg-purple-50' };
  if (r <= 2 && f >= 3) return { label: 'Под угрозой', color: 'text-orange-600', bg: 'bg-orange-50' };
  if (r <= 2 && f <= 2) return { label: 'Потерянные', color: 'text-red-600', bg: 'bg-red-50' };
  if (m >= 4 && r >= 3) return { label: 'Перспективные', color: 'text-indigo-600', bg: 'bg-indigo-50' };
  return { label: 'Обычные', color: 'text-gray-600', bg: 'bg-gray-50' };
};

// === Мини-компонент: бейдж скоринга ===
const ScoreBadge = ({ score, type }) => (
  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ${scoreColor(score, type)}`} title={scoreLabel(score)}>
    {score}
  </span>
);

// === Мини-компонент: карточка метрики ===
const StatCard = ({ title, value, subtitle, trend }) => (
  <div className="bg-white border border-[var(--color-border-light)] p-5 rounded-lg shadow-sm hover:shadow-md transition">
    <div className="text-sm text-gray-500 mb-1">{title}</div>
    <div className="text-2xl font-bold text-[var(--color-text)]">{value}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    {trend && (
      <div className={`text-xs mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% за неделю
      </div>
    )}
  </div>
);

// === Основной компонент ===
const RfmDashboard = () => {
  const navigate = useNavigate();
  const token = adminToken();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [page, setPage] = useState(1);

  const headers = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  // === Вспомогательная функция для маппинга эндпоинтов ===
  const getEndpoint = (tab) => ({
    'overview': 'users',
    'champions': 'top-champions',
    'at-risk': 'at-risk',
    'all': 'users'
  }[tab] || 'users');

  // Загрузка сводной аналитики
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/rfm/summary`, { headers });
      if (!res.ok) throw new Error('Не удалось загрузить аналитику');
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Загрузка пользователей с РФМ
  const fetchUsers = async (endpoint, pageToLoad = 1) => {
    setLoading(true);
    try {
      const isPaginated = ['users', 'all'].includes(activeTab);
      const url = isPaginated
        ? `${apiUrl}/admin/rfm/${endpoint}?page=${pageToLoad}&per_page=20`
        : `${apiUrl}/admin/rfm/${endpoint}`;

      const res = await fetch(url, { headers });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Не удалось загрузить данные');
      }

      const data = await res.json();

      // Для непорагинированных ответов (champions, at-risk)
      if (Array.isArray(data)) {
        setUsers(data);
        setMeta({
          current_page: 1,
          last_page: 1,
          total: data.length,
          from: data.length > 0 ? 1 : 0,
          to: data.length,
        });
      } else {
        // Для пагинированных ответов
        setUsers(data.data || []);
        setMeta({
          current_page: data.current_page ?? 1,
          last_page: data.last_page ?? 1,
          total: data.total ?? 0,
          from: data.from ?? null,
          to: data.to ?? null,
        });
        // Синхронизируем локальный page с серверным current_page
        setPage(data.current_page ?? pageToLoad);
      }
    } catch (e) {
      toast.error(e.message);
      setUsers([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };


  // === Пересчёт РФМ по кнопке ===
  const handleRecalculate = async () => {
    try {
      setLoading(true);
      toast.info('Запуск пересчёта РФМ...');

      const res = await fetch(`${apiUrl}/admin/rfm/recalculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ date: null }), // можно передать дату: "2024-01-15"
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Ошибка пересчёта');
      }

      // Уведомление с деталями
      toast.success(
        result.message +
        (result.elapsed_ms ? ` за ${result.elapsed_ms} мс` : '')
      );

      // После успешного пересчёта — обновляем данные
      await fetchSummary();
      const endpoint = getEndpoint(activeTab);
      await fetchUsers(endpoint, 1);
      setPage(1);

    } catch (e) {
      console.error('RFM Recalculate error:', e);
      toast.error(e.message || 'Не удалось запустить пересчёт');
    }
  };

  // Initial load
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      await fetchSummary();
      const endpoint = getEndpoint(activeTab);
      await fetchUsers(endpoint, 1);
      // setLoading(false) уже вызывается внутри fetchUsers
    };

    loadData();
  }, [token, activeTab]);

  // Пагинация
  const handlePageChange = (newPage) => {
    const endpoint = getEndpoint(activeTab);
    fetchUsers(endpoint, newPage);
  };

  // Обработчик кнопки "Обновить"
  const handleRefresh = () => {
    fetchSummary();
    const endpoint = getEndpoint(activeTab);
    fetchUsers(endpoint, 1);
    setPage(1);
  };

  if (!token) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">Требуется авторизация администратора</p>
          <button className="btn btn-primary" onClick={() => navigate("/admin/login")}>
            Войти
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="bg-[var(--color-bg-base)] pt-5 pb-20">
        <div className="container mx-auto px-4">

          {/* === HEADER с заголовком и кнопками === */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* В return, вокруг блока с датой */}
            <div key={summary?.calculated_at || 'no-date'}>
              <h1 className="title">RFM-аналитика пользователей</h1>
           
            </div>

            {/* Две кнопки: быстрый рефреш и полный пересчёт */}
            <div className="flex gap-2">
              {/* Кнопка 1: Обновить отображение данных */}
              <button
                className="btn border border-gray-300 bg-white hover:bg-gray-50 uppercase text-sm px-4 py-2 rounded-lg transition"
                onClick={handleRefresh}
                disabled={loading}
                title="Обновить отображение данных без пересчёта"
              >
                Данные
              </button>

              {/* Кнопка 2: Пересчитать РФМ (запускает artisan команду) */}
              <button
                className="btn btn-primary uppercase text-sm px-4 py-2 rounded-lg transition"
                onClick={handleRecalculate}
                disabled={loading}
                title="Пересчитать РФМ-скоринг для всех пользователей"
              >
                {loading ? ' Расчёт...' : 'Пересчитать РФМ'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'overview', label: 'Обзор' },
              { id: 'champions', label: 'Чемпионы' },
              { id: 'at-risk', label: 'Под угрозой' },
              { id: 'all', label: 'Все пользователи' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white shadow'
                    : 'bg-white border border-[var(--color-border-light)] text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-12">Загрузка аналитики...</div>
          ) : (
            <>
              {/* === OVERVIEW TAB === */}
              {activeTab === 'overview' && summary && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Всего пользователей с РФМ"
                      value={summary.total_users?.toLocaleString('ru-RU') || 0}
                      subtitle="с хотя бы одним оплаченным заказом"
                    />
                    <StatCard
                      title="Средний R-скор"
                      value={summary.avg_scores?.r_avg || '0.00'}
                      subtitle="Recency: чем выше — тем лучше"
                    />
                    <StatCard
                      title="Средний F-скор"
                      value={summary.avg_scores?.f_avg || '0.00'}
                      subtitle="Frequency: частота покупок"
                    />
                    <StatCard
                      title="Средний M-скор"
                      value={summary.avg_scores?.m_avg || '0.00'}
                      subtitle="Monetary: сумма покупок"
                    />
                  </div>

                  {/* Segment Distribution */}
                  <div className="bg-white border border-[var(--color-border-light)] p-5 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Распределение по сегментам</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {summary.segments?.map((seg, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="font-medium">{seg.segment_group}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                                style={{ width: `${Math.min(100, (seg.count / (summary.total_users || 1)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {seg.count} ({summary.total_users ? Math.round(seg.count / summary.total_users * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top RFM Segments */}
                  <div className="bg-white border border-[var(--color-border-light)] p-5 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">🔝 Топ-5 сегментов по количеству</h3>
                    <div className="flex flex-wrap gap-2">
                      {summary.top_segments?.map((seg, idx) => {
                        const info = getSegmentInfo(seg.rfm_segment);
                        return (
                          <span key={idx} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${info.bg} ${info.color} border-transparent`}>
                            {seg.rfm_segment}: {seg.count} чел.
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* === USERS TABLE (только для champions / at-risk / all) === */}
              {['champions', 'at-risk', 'all'].includes(activeTab) && (
                <div className="bg-white border border-[var(--color-border-light)] rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--color-bg-block)]">
                        <tr>
                          <th className="p-3 border text-left">Пользователь</th>
                          <th className="p-3 border text-center">RFM</th>
                          <th className="p-3 border text-center">R</th>
                          <th className="p-3 border text-center">F</th>
                          <th className="p-3 border text-center">M</th>
                          <th className="p-3 border text-right">Заказы</th>
                          <th className="p-3 border text-right">Сумма</th>
                        
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="p-6 text-center text-gray-500">
                              {activeTab === 'champions' && 'Нет пользователей-чемпионов'}
                              {activeTab === 'at-risk' && 'Нет пользователей под угрозой'}
                              {activeTab === 'all' && 'Пользователи не найдены'}
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => {
                            const segInfo = getSegmentInfo(user.rfm_segment || '000');
                            return (
                              <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="p-3 border">
                                  <div className="font-medium text-[var(--color-text)]">{user.name || 'Без имени'}</div>
                                  <div className="text-xs text-gray-500">{user.email || '-'}</div>
                                  {user.rfm_segment && (
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${segInfo.bg} ${segInfo.color}`}>
                                      {segInfo.label}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 border text-center font-mono font-bold text-lg">
                                  {user.rfm_segment || '---'}
                                </td>
                                <td className="p-3 border text-center">
                                  <ScoreBadge score={user.r_score} type="r" />
                                </td>
                                <td className="p-3 border text-center">
                                  <ScoreBadge score={user.f_score} type="f" />
                                </td>
                                <td className="p-3 border text-center">
                                  <ScoreBadge score={user.m_score} type="m" />
                                </td>
                                <td className="p-3 border text-right font-medium">
                                  {user.total_orders || user.orders_count || 0}
                                </td>
                                <td className="p-3 border text-right font-medium">
                                  {fmtMoney(user.orders_sum_grand_total || user.total_spent || 0)}
                                </td>
                             
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {meta?.last_page > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-600">
                        {meta.from && meta.to ? `Показано ${meta.from}–${meta.to} из ${meta.total}` : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn border border-gray-300 bg-white hover:bg-gray-50 uppercase text-sm"
                          disabled={(meta?.current_page ?? 1) <= 1}
                          onClick={() => handlePageChange((meta?.current_page ?? 1) - 1)}
                        >
                          Назад
                        </button>
                        <span className="text-sm text-gray-700">
                          Стр. {meta?.current_page ?? page} / {meta?.last_page ?? 1}
                        </span>
                        <button
                          className="btn border border-gray-300 bg-white hover:bg-gray-50 uppercase text-sm"
                          disabled={(meta?.current_page ?? 1) >= (meta?.last_page ?? 1)}
                          onClick={() => handlePageChange((meta?.current_page ?? 1) + 1)}
                        >
                          Вперёд
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default RfmDashboard;