import mysql from "mysql2/promise";
import "dotenv/config";
import { logger } from "./logger.js";

const connectionOptions = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DBNAME,
  
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  
  // 🔥 QUAN TRỌNG: Thêm dòng này để kết nối được với Clever Cloud / Cloud DB
  ssl: {
    rejectUnauthorized: false
  }
};

// Nếu có chuỗi URI (trường hợp dùng biến môi trường gộp)
if (process.env.MYSQL_URI) {
  Object.assign(connectionOptions, {
    uri: process.env.MYSQL_URI,
  });
}

export const pool = mysql.createPool(connectionOptions);

// Kiểm tra kết nối ngay khi khởi động server
pool.getConnection()
  .then((conn) => {
    logger.info(`✅ KẾT NỐI THÀNH CÔNG tới Database: ${process.env.MYSQL_HOST}`);
    conn.release();
  })
  .catch((err) => {
    logger.error("❌ LỖI KẾT NỐI DATABASE CLEVER CLOUD:", err);
    console.error("Gợi ý: Hãy kiểm tra xem Database trên Clever Cloud có đang ở trạng thái 'Running' không?");
  });