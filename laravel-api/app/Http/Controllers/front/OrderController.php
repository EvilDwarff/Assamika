<?php

namespace App\Http\Controllers\front;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // GET /api/orders (история моих заказов)
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $orders = Order::with(['items.product', 'user'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['status' => 200, 'data' => $orders]);
    }

    // GET /api/orders/{id} (один мой заказ)
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;

        $order = Order::with(['items.product', 'user'])
            ->where('user_id', $userId)
            ->find($id);

        if (!$order) {
            return response()->json(['status' => 404, 'message' => 'Order not found'], 404);
        }

        return response()->json(['status' => 200, 'data' => $order]);
    }

    // POST /api/orders
    // {payment_method, comment?}
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string|in:cash,card',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $user = $request->user();
        $userId = $user->id;

        if (!$user->mobile) {
            return response()->json(['status' => 400, 'message' => 'Заполните телефон в профиле'], 400);
        }
        if (!$user->address) {
            return response()->json(['status' => 400, 'message' => 'Заполните адрес в профиле'], 400);
        }

        $cart = Cart::with('items')->where('user_id', $userId)->first();
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['status' => 400, 'message' => 'Корзина пуста'], 400);
        }

        return DB::transaction(function () use ($request, $cart, $userId) {
            $productIds = $cart->items->pluck('product_id')->all();

            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0.0;
            $rows = [];

            foreach ($cart->items as $item) {
                $p = $products[$item->product_id] ?? null;
                if (!$p) {
                    return response()->json(['status' => 400, 'message' => 'Товар не найден'], 400);
                }

                if ($p->status === 'inactive') {
                    return response()->json(['status' => 400, 'message' => "Товар '{$p->name}' неактивен"], 400);
                }

                if ($p->status === 'sold_out' || (int)$p->reserve <= 0) {
                    return response()->json(['status' => 400, 'message' => "Товар '{$p->name}' распродан"], 400);
                }

                if ((int)$item->qty > (int)$p->reserve) {
                    return response()->json(['status' => 400, 'message' => "Недостаточно товара '{$p->name}' на складе"], 400);
                }

                $unitPrice = ($p->discount_price !== null && (float)$p->discount_price > 0)
                    ? (float)$p->discount_price
                    : (float)$p->price;

                $line = $unitPrice * (int)$item->qty;
                $subtotal += $line;

                $rows[] = [$p, $unitPrice, (int)$item->qty, $line];
            }

            $shipping = 0.0;
            $grandTotal = $subtotal + $shipping;

            $order = Order::create([
                'user_id' => $userId,
                'payment_method' => $request->payment_method,
                'comment' => $request->comment,
                'subtotal' => number_format($subtotal, 2, '.', ''),
                'shipping' => number_format($shipping, 2, '.', ''),
                'grand_total' => number_format($grandTotal, 2, '.', ''),
                'status' => 'new',
                'cancellation_reason' => null,
            ]);

            foreach ($rows as [$p, $unitPrice, $qty, $line]) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $p->id,
                    'name' => $p->name,
                    'price' => number_format($unitPrice, 2, '.', ''),
                    'qty' => $qty,
                    'line_total' => number_format($line, 2, '.', ''),
                ]);

                $p->reserve = (int)$p->reserve - $qty;
                $p->sold_count = (int)$p->sold_count + $qty;

                if ((int)$p->reserve <= 0) {
                    $p->reserve = 0;
                    $p->status = 'sold_out';
                } else {
                    $p->status = 'in_stock';
                }

                $p->save();
            }

            CartItem::where('cart_id', $cart->id)->delete();

            // ✅ важно: items.product чтобы на фронте было фото/вес
            $order->load(['items.product', 'user']);

            return response()->json([
                'status' => 200,
                'message' => 'Заказ создан',
                'data' => $order
            ], 200);
        });
    }
}
