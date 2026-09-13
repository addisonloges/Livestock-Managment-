CREATE TABLE `identity_counters` (
	`yearKey` integer PRIMARY KEY NOT NULL,
	`highWater` integer NOT NULL
);

--> statement-breakpoint
INSERT INTO identity_counters(yearKey,highWater) SELECT COALESCE(birthYear,0),MAX(COALESCE(birthSequence,seq)) FROM animals GROUP BY COALESCE(birthYear,0);
--> statement-breakpoint
INSERT INTO identity_counters(yearKey,highWater)
SELECT COALESCE(json_extract(before,'$.birthYear'),0),MAX(COALESCE(json_extract(before,'$.birthSequence'),json_extract(before,'$.seq')))
FROM animal_history WHERE json_valid(before) AND COALESCE(json_extract(before,'$.birthSequence'),json_extract(before,'$.seq'))>0
GROUP BY COALESCE(json_extract(before,'$.birthYear'),0)
ON CONFLICT(yearKey) DO UPDATE SET highWater=MAX(highWater,excluded.highWater);
--> statement-breakpoint
DROP TRIGGER assign_animal_birth_number;
--> statement-breakpoint
CREATE TRIGGER assign_animal_birth_number AFTER INSERT ON animals WHEN NEW.birthSequence IS NULL
BEGIN
 UPDATE animals SET birthSequence=MAX(COALESCE((SELECT highWater FROM identity_counters WHERE yearKey=COALESCE(NEW.birthYear,0)),0),COALESCE((SELECT MAX(birthSequence) FROM animals WHERE birthYear IS NEW.birthYear AND id!=NEW.id),0))+1 WHERE id=NEW.id;
END;
--> statement-breakpoint
CREATE TRIGGER reserve_inserted_animal_number AFTER INSERT ON animals WHEN NEW.birthSequence IS NOT NULL
BEGIN
 INSERT INTO identity_counters(yearKey,highWater) VALUES(COALESCE(NEW.birthYear,0),NEW.birthSequence) ON CONFLICT(yearKey) DO UPDATE SET highWater=MAX(highWater,excluded.highWater);
END;
--> statement-breakpoint
CREATE TRIGGER reserve_changed_animal_number AFTER UPDATE OF birthYear,birthSequence ON animals WHEN NEW.birthSequence IS NOT NULL AND (OLD.birthSequence IS NOT NEW.birthSequence OR OLD.birthYear IS NOT NEW.birthYear)
BEGIN
 INSERT INTO identity_counters(yearKey,highWater) VALUES(COALESCE(NEW.birthYear,0),NEW.birthSequence) ON CONFLICT(yearKey) DO UPDATE SET highWater=MAX(highWater,excluded.highWater);
END;
