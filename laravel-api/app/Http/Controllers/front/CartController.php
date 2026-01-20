<?php

namespace App\Http\Controllers\front;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    // GET /api/cart
    public function index(Request $request)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $cart->load(['items.product.category']);

        return response()->json([
            'status' => 200,
            'data' => $this->cartPayload($cart),
        ]);
    }

    // POST /api/cart/items  {product_id, qty}
    public function addItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'qty' => 'nullable|integer|min:1|max:999',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $qty = (int)($request->qty ?? 1);
        $product = Product::find($request->product_id);

        // нельзя добавлять inactive
        if ($product->status === 'inactive') {
            return response()->json(['status' => 400, 'message' => 'Товар неактивен'], 400);
        }

        // распродан / нет остатков
        if ($product->status === 'sold_out' || (int)$product->reserve <= 0) {
            return response()->json(['status' => 400, 'message' => 'Товар распродан'], 400);
        }

        if ($qty > (int)$product->reserve) {
            return response()->json(['status' => 400, 'message' => 'Недостаточно товара на складе'], 400);
        }

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $newQty = (int)$item->qty + $qty;
            if ($newQty > (int)$product->reserve) {
                return response()->json(['status' => 400, 'message' => 'Недостаточно товара на складе'], 400);
            }
            $item->qty = $newQty;
            $item->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'qty' => $qty,
            ]);
        }

        $cart->load(['items.product.category']);

        return response()->json([
            'status' => 200,
            'message' => 'Добавлено в корзину',
            'data' => $this->cartPayload($cart),
        ]);
    }

    // PUT /api/cart/items/{itemId} {qty}
    public function updateItem(Request $request, $itemId)
    {
        $validator = Validator::make($request->all(), [
            'qty' => 'required|integer|min:1|max:999',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $cart = Cart::where('user_id', $request->user()->id)->first();
        if (!$cart) {
            return response()->json(['status' => 404, 'message' => 'Корзина пуста'], 404);
        }

        $item = CartItem::where('cart_id', $cart->id)->where('id', $itemId)->first();
        if (!$item) {
            return response()->json(['status' => 404, 'message' => 'Позиция не найдена'], 404);
        }

        $product = Product::find($item->product_id);

        if ($product->status === 'inactive') {
            return response()->json(['status' => 400, 'message' => 'Товар неактивен'], 400);
        }

        if ($product->status === 'sold_out' || (int)$product->reserve <= 0) {
            return response()->json(['status' => 400, 'message' => 'Товар распродан'], 400);
        }

        if ((int)$request->qty > (int)$product->reserve) {
            return response()->json(['status' => 400, 'message' => 'Недостаточно товара на складе'], 400);
        }

        $item->qty = (int)$request->qty;
        $item->save();

        $cart->load(['items.product.category']);

        return response()->json([
            'status' => 200,
            'message' => 'Количество обновлено',
            'data' => $this->cartPayload($cart),
        ]);
    }

    // DELETE /api/cart/items/{itemId}
    public function removeItem(Request $request, $itemId)
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();
        if (!$cart) {
            return response()->json(['status' => 200, 'data' => ['items' => [], 'subtotal' => '0.00']]);
        }

        CartItem::where('cart_id', $cart->id)->where('id', $itemId)->delete();

        $cart->load(['items.product.category']);

        return response()->json([
            'status' => 200,
            'message' => 'Удалено',
            'data' => $this->cartPayload($cart),
        ]);
    }

    // DELETE /api/cart/clear
    public function clear(Request $request)
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();
        if ($cart) {
            CartItem::where('cart_id', $cart->id)->delete();
        }

        return response()->json(['status' => 200, 'message' => 'Корзина очищена']);
    }

    private function cartPayload(Cart $cart): array
    {
        $items = [];
        $subtotal = 0.0;

        foreach ($cart->items as $item) {
            $p = $item->product;

            $unitPrice = ($p->discount_price !== null && (float)$p->discount_price > 0)
                ? (float)$p->discount_price
                : (float)$p->price;

            $line = $unitPrice * (int)$item->qty;
            $subtotal += $line;

            $items[] = [
                'id' => $item->id,
                'qty' => (int)$item->qty,
                'product' => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'image' => $p->image,
                    'price' => $p->price,
                    'discount_price' => $p->discount_price,
                    'weight' => $p->weight,
                    'reserve' => $p->reserve,
                    'status' => $p->status,
                    'category' => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name] : null,
                ],
                'unit_price' => number_format($unitPrice, 2, '.', ''),
                'line_total' => number_format($line, 2, '.', ''),
            ];
        }

        return [
            'items' => $items,
            'subtotal' => number_format($subtotal, 2, '.', ''),
        ];
    }
}
