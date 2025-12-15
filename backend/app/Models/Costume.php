<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Costume extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'description',
        'category',
        'sizes',
        'images',
        'price_per_day',
        'available',
        'created_at',
    ];

    protected $casts = [
        'sizes' => 'array',
        'images' => 'array',
        'price_per_day' => 'decimal:2',
        'available' => 'boolean',
        'created_at' => 'datetime',
    ];
}
