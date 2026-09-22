-- CreateTable
CREATE TABLE "game_saves" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "seed" TEXT NOT NULL,
    "generatorVersion" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentSnapshotId" TEXT,

    CONSTRAINT "game_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_snapshots" (
    "id" TEXT NOT NULL,
    "gameSaveId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "simSeconds" INTEGER NOT NULL,
    "writtenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_events" (
    "id" TEXT NOT NULL,
    "gameSaveId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "simSeconds" INTEGER NOT NULL,
    "causedByCommandId" TEXT,
    "payload" JSONB NOT NULL,
    "persistedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_saves_currentSnapshotId_key" ON "game_saves"("currentSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_snapshots_gameSaveId_revision_key" ON "simulation_snapshots"("gameSaveId", "revision");

-- CreateIndex
CREATE INDEX "domain_events_gameSaveId_sequence_idx" ON "domain_events"("gameSaveId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "domain_events_gameSaveId_sequence_key" ON "domain_events"("gameSaveId", "sequence");

-- AddForeignKey
ALTER TABLE "game_saves" ADD CONSTRAINT "game_saves_currentSnapshotId_fkey" FOREIGN KEY ("currentSnapshotId") REFERENCES "simulation_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_snapshots" ADD CONSTRAINT "simulation_snapshots_gameSaveId_fkey" FOREIGN KEY ("gameSaveId") REFERENCES "game_saves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_gameSaveId_fkey" FOREIGN KEY ("gameSaveId") REFERENCES "game_saves"("id") ON DELETE CASCADE ON UPDATE CASCADE;
