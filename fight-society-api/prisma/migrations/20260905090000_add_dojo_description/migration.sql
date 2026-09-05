-- CreateTable
CREATE TABLE "dojo_descriptions" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dojo_descriptions_pkey" PRIMARY KEY ("id")
);
