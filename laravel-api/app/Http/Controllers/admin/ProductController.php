<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\TempImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('images', 'category')->orderByDesc('created_at')->get();

        return response()->json([
            'status' => 200,
            'data' => $products
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id'     => 'required|exists:categories,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'required|numeric|min:0',
            'discount_price'  => 'nullable|numeric|min:0',
            'weight'          => 'nullable|string|max:255',
            'reserve'         => 'nullable|integer|min:0',
            'sold_count'      => 'nullable|integer|min:0',
            'status'          => 'required|in:inactive,in_stock,sold_out',

            // массив id временных картинок
            'gallery'         => 'nullable|array',
            'gallery.*'       => 'integer|exists:temp_images,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $product = Product::create([
            'category_id'    => $request->category_id,
            'name'           => $request->name,
            'description'    => $request->description,
            'price'          => $request->price,
            'discount_price' => $request->discount_price,
            'weight'         => $request->weight,
            'reserve'        => $request->reserve ?? 0,
            'sold_count'     => $request->sold_count ?? 0,
            'status'         => $request->status,
        ]);

        // переносим temp -> products
        if (!empty($request->gallery)) {
            $this->moveTempImagesToProduct($product, $request->gallery);
        }

        return response()->json([
            'status' => 200,
            'message' => 'Product created successfully',
            'data' => $product->load('images')
        ], 200);
    }

    public function show($id)
    {
        $product = Product::with('images', 'category')->find($id);

        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        return response()->json(['status' => 200, 'data' => $product], 200);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id'     => 'required|exists:categories,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'required|numeric|min:0',
            'discount_price'  => 'nullable|numeric|min:0',
            'weight'          => 'nullable|string|max:255',
            'reserve'         => 'nullable|integer|min:0',
            'sold_count'      => 'nullable|integer|min:0',
            'status'          => 'required|in:inactive,in_stock,sold_out',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $product->update([
            'category_id'    => $request->category_id,
            'name'           => $request->name,
            'description'    => $request->description,
            'price'          => $request->price,
            'discount_price' => $request->discount_price,
            'weight'         => $request->weight,
            'reserve'        => $request->reserve ?? $product->reserve,
            'sold_count'     => $request->sold_count ?? $product->sold_count,
            'status'         => $request->status,
        ]);

        return response()->json([
            'status' => 200,
            'message' => 'Product updated successfully',
            'data' => $product->load('images')
        ], 200);
    }

    public function destroy($id)
    {
        $product = Product::with('images')->find($id);
        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        // удалить файлы галереи
        foreach ($product->images as $img) {
            File::delete(public_path('uploads/products/' . $img->image));
        }

        // удалить главный файл (если он не среди галереи)
        if ($product->image) {
            File::delete(public_path('uploads/products/' . $product->image));
        }

        $product->delete();

        return response()->json(['status' => 200, 'message' => 'Product deleted successfully'], 200);
    }

    // =======================
    // Images API
    // =======================

    // Добавить изображения к товару по temp ids
    public function addImagesFromTemp(Request $request, $productId)
    {
        $product = Product::find($productId);
        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'gallery'   => 'required|array|min:1',
            'gallery.*' => 'integer|exists:temp_images,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $this->moveTempImagesToProduct($product, $request->gallery);

        return response()->json([
            'status' => 200,
            'message' => 'Images added successfully',
            'data' => $product->load('images')
        ], 200);
    }

    public function deleteImage($imageId)
    {
        $image = ProductImage::find($imageId);
        if (!$image) {
            return response()->json(['status' => 404, 'message' => 'Product image not found'], 404);
        }

        $product = Product::find($image->product_id);

        File::delete(public_path('uploads/products/' . $image->image));

        // если удалили главную — сбросим или поставим первую из оставшихся
        if ($product && $product->image === $image->image) {
            $product->image = null;
            $product->save();
        }

        $image->delete();

        // если главной нет — попробуем назначить первую оставшуюся
        if ($product && !$product->image) {
            $first = $product->images()->first();
            if ($first) {
                $product->image = $first->image;
                $product->save();
            }
        }

        return response()->json(['status' => 200, 'message' => 'Image deleted successfully'], 200);
    }

    public function setDefaultImage(Request $request, $productId)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 400, 'errors' => $validator->errors()], 400);
        }

        $product = Product::with('images')->find($productId);
        if (!$product) {
            return response()->json(['status' => 404, 'message' => 'Product not found'], 404);
        }

        // можно проверить что это изображение реально принадлежит товару
        $exists = $product->images()->where('image', $request->image)->exists();
        if (!$exists) {
            return response()->json(['status' => 400, 'message' => 'Image does not belong to this product'], 400);
        }

        $product->image = $request->image;
        $product->save();

        return response()->json(['status' => 200, 'message' => 'Default image updated successfully'], 200);
    }

    // =======================
    // helper
    // =======================

    private function moveTempImagesToProduct(Product $product, array $tempIds): void
    {
        $productsDir = public_path('uploads/products');
        $tempDir     = public_path('uploads/temp');

        if (!File::exists($productsDir)) {
            File::makeDirectory($productsDir, 0755, true);
        }

        foreach ($tempIds as $key => $tempId) {
            $temp = TempImage::find($tempId);
            if (!$temp) continue;

            $from = $tempDir . '/' . $temp->name;
            if (!file_exists($from)) continue;

            $ext = pathinfo($temp->name, PATHINFO_EXTENSION);
            $fileName = $product->id . '-' . $key . '-' . time() . '-' . uniqid() . '.' . $ext;
            $to = $productsDir . '/' . $fileName;

            // переносим файл
            File::move($from, $to);

            // пишем в product_images
            $pi = ProductImage::create([
                'product_id' => $product->id,
                'image' => $fileName,
            ]);

            // первая картинка = главная (если еще не установлена)
            if (!$product->image) {
                $product->image = $pi->image;
                $product->save();
            }

            // удаляем temp запись
            $temp->delete();
        }
    }
}
