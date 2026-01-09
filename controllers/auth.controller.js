import { registerUser, loginUser } from '../services/auth.service.js';

export async function registerController(req, res) {
    await registerUser(req.body);
    return res.status(201).json({ message: 'Đăng nhập thành công' });
}

export async function loginController(req, res) {
    const token = await loginUser(req.body.email, req.body.password);
    if (!token) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu sai' });
    }
    return res.status(200).json({ token });
}
