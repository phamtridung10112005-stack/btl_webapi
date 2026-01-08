// File: create-sachyeuthich.validator.js
import { z } from "zod";
export const createSachYeuThichSchema = z.object({
  User_ID: z.int({ required_error: 'User_ID is required' }),
  MaSach: z.int().min(1, 'MaSach is required'),
});
export function validateCreateSachYeuThich(data) {
  return createSachYeuThichSchema.parse(data);
}
