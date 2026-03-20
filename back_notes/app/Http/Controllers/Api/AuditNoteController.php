<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditNote;

class AuditNoteController extends Controller
{
    public function index(Request $request)
    {

        $query = AuditNote::query();

        $baseQuery = AuditNote::query();

        // filtre type operation
        if ($request->type_operation) {
            $baseQuery->where('type_operation', $request->type_operation);
        }

        // filtre matiere
        if ($request->matiere) {
            $baseQuery->where('design', 'ILIKE', '%' . $request->matiere . '%');
        }

        // filtre etudiant
        if ($request->etudiant) {
            $baseQuery->where('nom', 'ILIKE', '%' . $request->etudiant . '%');
        }

        // filtre utilisateur
        if ($request->name) {
            $baseQuery->where('name', 'ILIKE', '%' . $request->name . '%');
        }

        // filtre date début
        if ($request->date_de) {
            $baseQuery->whereDate('date_mise_a_jour', '>=', $request->date_de);
        }

        // filtre date fin
        if ($request->date_a) {
            $baseQuery->whereDate('date_mise_a_jour', '<=', $request->date_a);
        }

    $audits = (clone $baseQuery)
    ->orderBy('date_mise_a_jour','desc')
    ->get();

        // statistiques
    $stats = [
    'insertions' => (clone $baseQuery)->where('type_operation','ajout')->count(),
    'modifications' => (clone $baseQuery)->where('type_operation','modification')->count(),
    'suppressions' => (clone $baseQuery)->where('type_operation','suppression')->count(),
];

    return response()->json([
        'data' => $audits,
        'stats' => $stats
    ]);
    }
}
//  