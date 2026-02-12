-- Add map_labels table for custom map display names
CREATE TABLE "map_labels" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "mapPath" TEXT NOT NULL UNIQUE,
  "label" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "map_labels_mapPath_key" ON "map_labels"("mapPath");
