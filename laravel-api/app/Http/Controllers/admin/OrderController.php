<?php


namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // GET /api/admin/orders
    // фильтры: status, q (по id/имя/email/телефон), user_id
    public function index(Request $request)
    {
        $q = Order::with(['items.product', 'user'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $q->where('user_id', $request->user_id);
        }

        if ($request->filled('q')) {
            $search = trim($request->q);

            $q->where(function ($qq) use ($search) {
                // поиск по id заказа
                if (ctype_digit($search)) {
                    $qq->orWhere('id', (int)$search);
                }

                // поиск по данным пользователя (name/email/mobile)
                $qq->orWhereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('mobile', 'like', "%{$search}%");
                });
            });
        }

        $perPage = (int)($request->per_page ?? 20);
        if ($perPage < 1) $perPage = 20;
        if ($perPage > 100) $perPage = 100;

        $orders = $q->paginate($perPage);

        return response()->json([
            'status' => 200,
            'data' => $orders
        ]);
    }

    // GET /api/admin/orders/{id}
    public function show($id)
    {
        $order = Order::with(['items.product', 'user'])->find($id);

        if (!$order) {
            return response()->json(['status' => 404, 'message' => 'Order not found'], 404);
        }

        return response()->json(['status' => 200, 'data' => $order]);
    }

    // PATCH /api/admin/orders/{id}/status
    // { status: new|processing|shipped|delivered|canceled, cancellation_reason? }
    public function updateStatus(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['status' => 404, 'message' => 'Order not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:new,processing,shipped,delivered,canceled',
            'cancellation_reason' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $newStatus = $request->status;

        // если отменяем — нужна причина (по желанию можешь сделать обязательной)
        if ($newStatus === 'canceled' && !$request->filled('cancellation_reason')) {
            return response()->json([
                'status' => 400,
                'message' => 'Укажите причину отмены'
            ], 400);
        }

        $order->status = $newStatus;

        if ($newStatus === 'canceled') {
            $order->cancellation_reason = $request->cancellation_reason;
        } else {
            // при смене на любой другой статус — очищаем причину
            $order->cancellation_reason = null;
        }

        $order->save();

        $order->load(['items.product', 'user']);

        return response()->json([
            'status' => 200,
            'message' => 'Статус обновлён',
            'data' => $order
        ]);
    }
}


