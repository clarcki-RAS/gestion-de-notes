<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    //
    protected $fillable = [
    'etudiant_id',
    'matiere_id',
    'note'
];
    public function etudiant()
{
    return $this->belongsTo(Etudiant::class);
}

public function matiere()
{
    return $this->belongsTo(Matiere::class);
}
}
