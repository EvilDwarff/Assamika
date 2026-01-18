<?php


namespace App\Http\Controllers\front;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products?categories=1,2&sort=cheap|expensive|new|popular
    public function index(Request $request)
    {
        $sort = $request->query('sort', 'popular'); // popular|new|cheap|expensive
        $categories = $request->query('categories'); // "1,2,3"

        $q = Product::query()
            ->with(['category', 'images'])
            // ✅ не отдаём inactive
            ->whereIn('status', ['in_stock', 'sold_out']);

        // фильтр по категориям
        if (!empty($categories)) {
            $ids = collect(explode(',', $categories))
                ->map(fn($v) => (int)trim($v))
                ->filter(fn($v) => $v > 0)
                ->values()
                ->all();

            if (!empty($ids)) {
                $q->whereIn('category_id', $ids);
            }
        }

        // сортировка
        switch ($sort) {
            case 'cheap':
                $q->orderByRaw('COALESCE(discount_price, price) asc');
                break;
            case 'expensive':
                $q->orderByRaw('COALESCE(discount_price, price) desc');
                break;
            case 'new':
                $q->orderBy('created_at', 'desc');
                break;
            case 'popular':
            default:
                $q->orderBy('sold_count', 'desc')
                  ->orderBy('created_at', 'desc');
                break;
        }

        // можно добавить пагинацию
        $products = $q->get();

        return response()->json([
            'status' => 200,
            'data' => $products
        ]);
    }

    // GET /api/products/{id}
    public function show($id)
    {
        $product = Product::with(['category', 'images'])
            ->whereIn('status', ['in_stock', 'sold_out']) // ✅ inactive не показываем
            ->find($id);

        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        // флаг “распродан” для фронта
        $product->is_sold_out = ($product->status === 'sold_out' || (int)$product->reserve <= 0);

        return response()->json([
            'status' => 200,
            'data' => $product
        ]);
    }
}
