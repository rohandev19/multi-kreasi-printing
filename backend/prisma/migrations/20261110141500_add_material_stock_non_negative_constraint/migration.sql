-- Layer 1 Defense-in-Depth: Prevent Material current_stock from ever going negative (< 0)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'materials_current_stock_non_negative'
  ) THEN
    UPDATE "materials" SET "current_stock" = 0 WHERE "current_stock" < 0;
    ALTER TABLE "materials"
      ADD CONSTRAINT "materials_current_stock_non_negative"
      CHECK ("current_stock" >= 0);
  END IF;
END $$;

