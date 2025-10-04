-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('Admin', 'Ustadz', 'WaliSantri') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `santriId` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_santriId_key`(`santriId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `santri` (
    `id` VARCHAR(191) NOT NULL,
    `nis` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kamar` VARCHAR(191) NOT NULL,
    `angkatan` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `santri_nis_key`(`nis`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penilaian_tahfidz` (
    `id` VARCHAR(191) NOT NULL,
    `santriId` VARCHAR(191) NOT NULL,
    `minggu` DATETIME(3) NOT NULL,
    `surah` VARCHAR(191) NOT NULL,
    `ayatSetor` INTEGER NOT NULL,
    `target` INTEGER NOT NULL,
    `tajwid` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `diinputOlehId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penilaian_mapel` (
    `id` VARCHAR(191) NOT NULL,
    `santriId` VARCHAR(191) NOT NULL,
    `mapel` ENUM('Fiqh', 'BahasaArab') NOT NULL,
    `formatif` INTEGER NOT NULL,
    `sumatif` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `diinputOlehId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penilaian_akhlak` (
    `id` VARCHAR(191) NOT NULL,
    `santriId` VARCHAR(191) NOT NULL,
    `disiplin` INTEGER NOT NULL,
    `adab` INTEGER NOT NULL,
    `kebersihan` INTEGER NOT NULL,
    `kerjasama` INTEGER NOT NULL,
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `diinputOlehId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kehadiran` (
    `id` VARCHAR(191) NOT NULL,
    `santriId` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `status` ENUM('H', 'S', 'I', 'A') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `diinputOlehId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bobot_konfigurasi` (
    `id` VARCHAR(191) NOT NULL,
    `tahfidz` DOUBLE NOT NULL DEFAULT 0.30,
    `fiqh` DOUBLE NOT NULL DEFAULT 0.20,
    `bahasaArab` DOUBLE NOT NULL DEFAULT 0.20,
    `akhlak` DOUBLE NOT NULL DEFAULT 0.20,
    `kehadiran` DOUBLE NOT NULL DEFAULT 0.10,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_tahfidz` ADD CONSTRAINT `penilaian_tahfidz_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_tahfidz` ADD CONSTRAINT `penilaian_tahfidz_diinputOlehId_fkey` FOREIGN KEY (`diinputOlehId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_mapel` ADD CONSTRAINT `penilaian_mapel_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_mapel` ADD CONSTRAINT `penilaian_mapel_diinputOlehId_fkey` FOREIGN KEY (`diinputOlehId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_akhlak` ADD CONSTRAINT `penilaian_akhlak_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penilaian_akhlak` ADD CONSTRAINT `penilaian_akhlak_diinputOlehId_fkey` FOREIGN KEY (`diinputOlehId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kehadiran` ADD CONSTRAINT `kehadiran_santriId_fkey` FOREIGN KEY (`santriId`) REFERENCES `santri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kehadiran` ADD CONSTRAINT `kehadiran_diinputOlehId_fkey` FOREIGN KEY (`diinputOlehId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
