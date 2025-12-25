import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET;
export async function registerUser(dto) {
    const hashedPassword = await bcrypt.hash(dto.password, 8);

    return userRepository.create({
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: dto.role,
    });
}

export async function loginUser(email, password) {
    const user = await userRepository.getByEmail(email);
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
}