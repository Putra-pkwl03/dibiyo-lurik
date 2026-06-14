import { Realtime } from "@upstash/realtime";
import { z } from "zod"; 
import { redis } from "./redis";

const schema = {
  notification: {
    // Dipicu saat CS membuat POC / POR baru
    created: z.object({
      id_order: z.string(),
      tipe: z.enum(["POC", "POR"]), 
      nama_customer: z.string(),
      pesan: z.string(),
      waktu: z.string(),
    }),
    // Dipicu saat Kepala Produksi menyelesaikan tugas produksi
    status_changed: z.object({
      id_order: z.string(),
      tipe: z.enum(["POC", "POR"]),
      status_baru: z.string(),
      pesan: z.string(),
      waktu: z.string(),
    }),
  },
};

export const realtime = new Realtime({ schema, redis });