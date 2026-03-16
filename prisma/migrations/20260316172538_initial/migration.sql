-- AlterTable
ALTER TABLE "patient_profile" ADD COLUMN     "cid" TEXT,
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "diseaseType" TEXT,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "ecog" INTEGER;

-- CreateTable
CREATE TABLE "vital_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "oxygenSaturation" INTEGER,
    "weight" DOUBLE PRECISION,
    "painLevel" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vital_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "days" TEXT[],
    "reminder_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_reports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "share_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "include_blood_pressure" BOOLEAN NOT NULL,
    "include_heart_rate" BOOLEAN NOT NULL,
    "include_temperature" BOOLEAN NOT NULL,
    "include_oxygen" BOOLEAN NOT NULL,
    "include_weight" BOOLEAN NOT NULL,
    "include_pain" BOOLEAN NOT NULL,
    "include_profile" BOOLEAN NOT NULL,
    "date_from" TIMESTAMP(3),
    "date_to" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vital_record_userId_idx" ON "vital_record"("userId");

-- CreateIndex
CREATE INDEX "vital_record_recordedAt_idx" ON "vital_record"("recordedAt");

-- CreateIndex
CREATE INDEX "reminders_userId_idx" ON "reminders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_reports_share_code_key" ON "shared_reports"("share_code");

-- AddForeignKey
ALTER TABLE "patient_profile" ADD CONSTRAINT "patient_profile_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_record" ADD CONSTRAINT "vital_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_reports" ADD CONSTRAINT "shared_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
