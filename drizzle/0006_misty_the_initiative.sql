ALTER TABLE `animals` ADD `birthSequence` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_animals_birth_number` ON `animals` (`birthYear`,`birthSequence`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_animals_unknown_birth_number` ON `animals` (`birthSequence`) WHERE "animals"."birthYear" IS NULL;
--> statement-breakpoint
WITH numbered AS (SELECT id, ROW_NUMBER() OVER (PARTITION BY birthYear ORDER BY seq) AS number FROM animals)
UPDATE animals SET birthSequence=(SELECT number FROM numbered WHERE numbered.id=animals.id);
--> statement-breakpoint
INSERT INTO animal_history(operationId,animalId,action,reason,before,after,createdAt)
SELECT 'birth-number-migration:'||id,id,'display-id','Numbering now restarts within each birth year; the former ID remains searchable',json_object('seq',seq,'birthYear',birthYear),json_object('seq',seq,'birthYear',birthYear,'birthSequence',birthSequence),strftime('%Y-%m-%dT%H:%M:%fZ','now') FROM animals;
--> statement-breakpoint
CREATE TRIGGER assign_animal_birth_number AFTER INSERT ON animals WHEN NEW.birthSequence IS NULL BEGIN UPDATE animals SET birthSequence=(SELECT COALESCE(MAX(birthSequence),0)+1 FROM animals WHERE birthYear IS NEW.birthYear AND id!=NEW.id) WHERE id=NEW.id; END;
