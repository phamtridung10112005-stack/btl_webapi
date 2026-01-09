// File: create-giamgia.validator.js
import { z } from "zod";
const nullableDate = z.preprocess(
  (v) => {
    if (v === "" || v === null) return null;
    if (typeof v === "string") return new Date(v);
    return v;
  },
  z.date().nullable()
);

const nullableInt = z.preprocess(
  v => v === "" || v === null ? null : Number(v),
  z.number().int().min(1).nullable()
);
export const createGiamGiaSchema = z.object({
  MaGiamGia: z.string({ required_error: 'MaGiamGia is required' }).trim(),
  PhanTramGiam: z.number().int().min(1, 'PhanTramGiam is required'),
  NgayBatDau: nullableDate,
  NgayKetThuc: nullableDate,
  SoLuong: nullableInt
});
export function validateCreateGiamGia(data) {
  return createGiamGiaSchema.parse(data);
}