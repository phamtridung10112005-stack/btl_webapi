import { checkPolicy } from "../services/policy.service.js";

export function authorizePolicy(policy) {
    return async (req, res, next) => {
        const resourceUserId = req.params.id;
        console.log("Resource User ID:", resourceUserId);
        const allowed = await checkPolicy({
            user: req.user,
            policy,
            resourceUserId,
        });
        if (!allowed) {
            return res.status(403).json({ message: "Forbidden: You don't have permission to access this resource." });
        }
        next();
    };
}