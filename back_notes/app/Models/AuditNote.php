<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditNote extends Model
{
    //
    protected $fillable = [
    'type_operation',
    'date_mise_a_jour',
    'etudiant_id',
    'nom',
    'design',
    'note_ancien',
    'note_nouv',
    'user_id',
    'name',           
    'machine_hote',
];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
