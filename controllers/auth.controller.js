import { registerUser, loginUser } from '../services/auth.service.js';

export async function registerController(req, res) {
    await registerUser(req.body);
    return res.status(201).json({ message: 'User registered successfully' });
}

export async function loginController(req, res) {
    const token = await loginUser(req.body.email, req.body.password);
    if (!token) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.status(200).json({ token });
}
