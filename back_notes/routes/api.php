<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\AuthController;

Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);
Route::apiResource('etudiants', EtudiantController::class);
Route::apiResource('matieres', MatiereController::class);
Route::apiResource('notes', NoteController::class);
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout',[AuthController::class,'logout']);
    Route::get('/profile',[AuthController::class,'profile']);

});

Route::get('/test', function () {
    return response()->json([
        'message' => 'API Laravel fonctionne'
    ]);
});