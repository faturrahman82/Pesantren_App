// src/services/authService.js

const bcrypt = require('bcryptjs');
// Import PrismaClient langsung di service untuk kejelasan (bisa juga dari app.js jika disediakan)
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt'); // Sesuaikan path
const { ROLE } = require('../utils/constants');   // Sesuaikan path

const login = async (email, password) => {
  console.log("DEBUG: AuthService login called for email:", email); // Log tambahan untuk debugging

  // Inisialisasi PrismaClient di dalam fungsi
  const prisma = new PrismaClient();

  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    console.log("DEBUG: User found in DB:", !!user); // Log apakah user ditemukan

    if (!user) {
      // Sangat penting: jangan spesifikasikan apakah email atau password salah untuk keamanan
      // Kita tetap melempar error yang sama
      throw new Error('Invalid email or password');
    }

    // Bandingkan password inputan dengan password yang sudah di-hash di database
    // bcrypt.compare akan mengambil password plain-text (inputan user),
    // dan hash yang disimpan di database, lalu membandingkannya.
    console.log("DEBUG: Comparing password..."); // Log sebelum compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("DEBUG: Password comparison result:", isPasswordValid); // Log hasil compare

    if (!isPasswordValid) {
      // Password tidak cocok
      throw new Error('Invalid email or password');
    }

    // Jika valid, generate token
    const token = generateToken(user.id);

    // Jangan kembalikan password dalam response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } catch (error) {
    // Pastikan untuk melempar error agar bisa ditangani di controller
    throw error;
  } finally {
    // Pastikan koneksi Prisma ditutup
    await prisma.$disconnect();
  }
};

const register = async (email, password, role, santriId = null) => {
  console.log("DEBUG: AuthService register called for email:", email, "role:", role); // Log tambahan

  // Inisialisasi PrismaClient di dalam fungsi
  const prisma = new PrismaClient();

  try {
    // Validasi role
    if (!Object.values(ROLE).includes(role)) {
      throw new Error('Invalid role');
    }

    // Hash password sebelum disimpan
    // bcrypt.hash mengambil plain-text password dan menghasilkan hash
    console.log("DEBUG: Hashing password..."); // Log sebelum hashing
    const hashedPassword = await bcrypt.hash(password, 10); // 10 adalah cost factor
    console.log("DEBUG: Password hashed successfully"); // Log setelah hashing

    // Buat user baru dengan password yang sudah di-hash
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Simpan hash, bukan password plain-text
        role,
        santriId: role === ROLE.WALI_SANTRI ? santriId : null, // Hanya set santriId jika role adalah WaliSantri
      },
    });

    console.log("DEBUG: User created in DB with id:", newUser.id); // Log setelah create

    // Generate token untuk user baru
    const token = generateToken(newUser.id);

    // Jangle kembalikan password
    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, token };
  } catch (error) {
    // Pastikan untuk melempar error agar bisa ditangani di controller
    throw error;
  } finally {
    // Pastikan koneksi Prisma ditutup
    await prisma.$disconnect();
  }
};

module.exports = {
  login,
  register,
};