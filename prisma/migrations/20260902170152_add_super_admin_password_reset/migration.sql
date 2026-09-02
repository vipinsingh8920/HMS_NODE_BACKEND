-- CreateTable
CREATE TABLE "super_admin_password_resets" (
    "id" SERIAL NOT NULL,
    "super_admin_id" INTEGER NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admin_password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_password_resets_token_hash_key" ON "super_admin_password_resets"("token_hash");

-- CreateIndex
CREATE INDEX "super_admin_password_resets_super_admin_id_idx" ON "super_admin_password_resets"("super_admin_id");

-- CreateIndex
CREATE INDEX "super_admin_password_resets_expires_at_idx" ON "super_admin_password_resets"("expires_at");

-- AddForeignKey
ALTER TABLE "super_admin_password_resets" ADD CONSTRAINT "super_admin_password_resets_super_admin_id_fkey" FOREIGN KEY ("super_admin_id") REFERENCES "super_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
