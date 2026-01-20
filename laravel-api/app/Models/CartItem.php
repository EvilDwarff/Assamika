<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['cart_id','product_id','qty'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
