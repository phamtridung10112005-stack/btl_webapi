/**
 * Middleware chuyển đổi User_ID (kiểu cũ) sang user_id (kiểu chuẩn)
 * để tương thích giữa Frontend và Policy/Controller
 */
export const normalizeUserId = (req, res, next) => {
    // 1. Xử lý cho BODY (thường dùng cho POST/PUT)
    if (req.body && req.body.User_ID) {
        req.body.user_id = req.body.User_ID;
        // req.params.user_id = req.body.User_ID; // Đồng bộ vào params luôn để dùng trong authorizePolicy
        // console.log(`Normalized User_ID in body: ${req.body.User_ID} -> ${req.body.user_id}`);
    }

    // 2. Xử lý cho QUERY PARAMS (thường dùng cho DELETE/GET)
    if (req.query && req.query.User_ID) {
        req.query.user_id = req.query.User_ID;
        // req.params.user_id = req.query.User_ID; // Đồng bộ vào params luôn để dùng trong authorizePolicy
        // console.log(`Normalized User_ID in query: ${req.query.User_ID} -> ${req.query.user_id}`);
    }

    // 3. Xử lý cho PARAMS (nếu có)
    if (req.params && req.params.User_ID) {
        req.params.user_id = req.params.User_ID;
        // console.log(`Normalized User_ID in params: ${req.params.User_ID} -> ${req.params.user_id}`);
    }

    // Chuyển tiếp sang middleware tiếp theo
    next();
};