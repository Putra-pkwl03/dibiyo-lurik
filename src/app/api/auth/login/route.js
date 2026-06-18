﻿import supabaseAdmin from "@/lib/supabase-admin";

import supabasePublic from "@/lib/supabase-public";

import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();

    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { success: false, message: "Username dan password wajib diisi" },

        { status: 400 },
      );
    }

    // Step 1: cari profile by username

    const { data: profile, error: profileError } = await supabaseAdmin

      .from("profiles")

      .select("id, username, email, nama, role, avatar_url")

      .eq("username", username)

      .single();

    if (profileError || !profile) {
      return Response.json(
        { success: false, message: "Username atau password salah" },

        { status: 401 },
      );
    }

    // Step 2: sign in dengan email ke Supabase Auth

    const { data: authData, error: authError } =
      await supabasePublic.auth.signInWithPassword({
        email: profile.email,

        password: password,
      });

    if (authError || !authData.session) {
      return Response.json(
        { success: false, message: "Username atau password salah" },

        { status: 401 },
      );
    }

    // --- DI DALAM API LOGIN (Ubah bagian setting cookie access token) ---

    const cookieStore = await cookies();

    cookieStore.set("sb-access-token", authData.session.access_token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 600, // <--- UBAH JADI 5 MENIT (300 detik)
    });

    cookieStore.set("sb-refresh-token", authData.session.refresh_token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 24 * 7, // Tetap 7 hari untuk refresh token
    });

    // Simpan role user untuk pengecekan cepat di middleware/layout client

    cookieStore.set("user-role", profile.role, {
      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 24 * 7,
    });

    // Step 3: Return data sukses menggunakan format Web Standard Response

    return Response.json(
      {
        success: true,

        data: {
          session: authData.session,

          user: authData.user,

          profile: profile,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan server internal",
      },

      { status: 500 },
    );
  }
}

