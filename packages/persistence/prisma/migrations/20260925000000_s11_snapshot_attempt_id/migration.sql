-- AlterTable
ALTER TABLE "simulation_snapshots" ADD COLUMN     "attemptId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "simulation_snapshots_gameSaveId_attemptId_key" ON "simulation_snapshots"("gameSaveId", "attemptId");
