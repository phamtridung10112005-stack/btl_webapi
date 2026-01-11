import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_tam_thoi"; // Fallback nếu chưa có env

export async function registerUser(dto) {
    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(dto.password, 8);

    return userRepository.create({
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: dto.role,
    });
}

// Hàm loginUser phải có chữ export ở đầu
export async function loginUser(email, password) {
    const user = await userRepository.getByEmail(email);
    if (!user) {
        throw new Error("Invalid email or password");
    }
    
    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    
    // Tạo token
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "48h" }
    );
}