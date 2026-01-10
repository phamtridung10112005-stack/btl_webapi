// File: update-giamgia.validator.js
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
export const updateGiamGiaSchema = z.object({
  PhanTramGiam: z.number().int().min(1, "Phan tram giam phai hon hon 1").optional(),
  NgayBatDau: nullableDate,
  NgayKetThuc: nullableDate,
  SoLuong: nullableInt
});
export function validateUpdateGiamGia(data) {
  return updateGiamGiaSchema.parse(data);
}
