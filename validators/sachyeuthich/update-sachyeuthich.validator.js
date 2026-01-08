// File: update-sachyeuthich.validator.js
import { z } from "zod";
export const updateSachYeuThichSchema = z.object({
  NgayTao: z.string().refine((d) => !isNaN(Date.parse(d)), "NGAYTAO is required").transform((d) => new Date(d))
});
export function validateUpdateSachYeuThich(data) {
  return updateSachYeuThichSchema.parse(data);
}
