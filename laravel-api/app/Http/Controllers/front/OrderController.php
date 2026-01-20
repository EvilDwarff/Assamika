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
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)   
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['status' => 200, 'data' => $orders]);
    }

    // GET /api/orders/{id} (один мой заказ)
    public function show(Request $request, $id)
    {
        $order = Order::with('items')
            ->where('user_id', $request->user()->id)   
            ->find($id);

        if (!$order) {
            return response()->json(['status' => 404, 'message' => 'Order not found'], 404);
        }

        return response()->json(['status' => 200, 'data' => $order]);
    }

    // POST /api/orders
    // {name, phone, address?, comment?}
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'nullable|string|max:255',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $userId = $request->user()->id;

        $cart = Cart::with('items')->where('user_id', $userId)->first();
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['status' => 400, 'message' => 'Корзина пуста'], 400);
        }

        return DB::transaction(function () use ($request, $cart, $userId) {
            $productIds = $cart->items->pluck('product_id')->all();
            $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

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

            // доставка (пока 0, можешь заменить логикой)
            $shipping = 0.0;
            // пример логики:
            // $shipping = $subtotal >= 3000 ? 0 : 300;

            $grandTotal = $subtotal + $shipping;

            $order = Order::create([
                'user_id' => $userId,
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
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

                // списание остатков
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

            // очистка корзины
            CartItem::where('cart_id', $cart->id)->delete();

            $order->load('items');

            return response()->json([
                'status' => 200,
                'message' => 'Заказ создан',
                'data' => $order
            ], 200);
        });
    }
}
