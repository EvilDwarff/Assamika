<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
    'user_id',
    'name',
    'phone',
    'address',
    'subtotal',
    'shipping',
    'grand_total',
    'status',
    'cancellation_reason',
];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
