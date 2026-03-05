<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared('
    CREATE OR REPLACE FUNCTION handle_note_operations()
    RETURNS TRIGGER AS $$
    DECLARE
        v_user_id bigint;
        v_nom text;
        v_design text;
        v_note_old numeric;
        v_note_new numeric;
    BEGIN

        -- récupérer user connecté
        BEGIN
            v_user_id := current_setting(\'app.current_user_id\')::bigint;
        EXCEPTION
            WHEN OTHERS THEN
                v_user_id := NULL;
        END;

        IF (TG_OP = \'INSERT\') THEN

            SELECT nom INTO v_nom FROM etudiants WHERE id = NEW.etudiant_id;
            SELECT design INTO v_design FROM matieres WHERE id = NEW.matiere_id;

            INSERT INTO audit_notes(
                type_operation,
                date_mise_a_jour,
                etudiant_id,
                nom,
                design,
                note_ancien,
                note_nouv,
                user_id,
                created_at,
                updated_at
            )
            VALUES(
                \'ajout\',
                now(),
                NEW.etudiant_id,
                v_nom,
                v_design,
                NULL,
                NEW.note,
                v_user_id,
                now(),
                now()
            );

        ELSIF (TG_OP = \'UPDATE\') THEN

            SELECT nom INTO v_nom FROM etudiants WHERE id = NEW.etudiant_id;
            SELECT design INTO v_design FROM matieres WHERE id = NEW.matiere_id;

            INSERT INTO audit_notes(
                type_operation,
                date_mise_a_jour,
                etudiant_id,
                nom,
                design,
                note_ancien,
                note_nouv,
                user_id,
                created_at,
                updated_at
            )
            VALUES(
                \'modification\',
                now(),
                NEW.etudiant_id,
                v_nom,
                v_design,
                OLD.note,
                NEW.note,
                v_user_id,
                now(),
                now()
            );

        ELSIF (TG_OP = \'DELETE\') THEN

            SELECT nom INTO v_nom FROM etudiants WHERE id = OLD.etudiant_id;
            SELECT design INTO v_design FROM matieres WHERE id = OLD.matiere_id;

            INSERT INTO audit_notes(
                type_operation,
                date_mise_a_jour,
                etudiant_id,
                nom,
                design,
                note_ancien,
                note_nouv,
                user_id,
                created_at,
                updated_at
            )
            VALUES(
                \'suppression\',
                now(),
                OLD.etudiant_id,
                v_nom,
                v_design,
                OLD.note,
                NULL,
                v_user_id,
                now(),
                now()
            );

        END IF;

        -- recalcul moyenne
        UPDATE etudiants
        SET moyenne = (
            SELECT COALESCE(SUM(n.note * m.coef) / NULLIF(SUM(m.coef),0),0)
            FROM notes n
            JOIN matieres m ON n.matiere_id = m.id
            WHERE n.etudiant_id = COALESCE(NEW.etudiant_id, OLD.etudiant_id)
        )
        WHERE id = COALESCE(NEW.etudiant_id, OLD.etudiant_id);

        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_note_operations
    AFTER INSERT OR UPDATE OR DELETE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION handle_note_operations();
    ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('
        DROP TRIGGER IF EXISTS trigger_note_operations ON notes;
        DROP FUNCTION IF EXISTS handle_note_operations;
    ');
    }
};
