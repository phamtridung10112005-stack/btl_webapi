import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

// 1. Import thư viện Swagger
import swaggerUi from "swagger-ui-express"; // <--- THÊM DÒNG NÀY
import swaggerJsdoc from "swagger-jsdoc";   // <--- THÊM DÒNG NÀY

import { requestLogger } from "./middlewares/logger.middleware.js";
import apiRoutes from "./routes/api.js";
import webRoutes from "./routes/web.js";
import { logger } from "./config/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Khai báo PORT sớm để dùng trong config Swagger

// ---------------------------
// Basic & Security Middlewares
// ---------------------------

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

// ---------------------------
// Custom Logging Middleware
// ---------------------------
app.use(requestLogger);

// ---------------------------
// CẤU HÌNH SWAGGER (THÊM ĐOẠN NÀY)
// ---------------------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookStore API Documentation",
      version: "1.0.0",
      description: "Tài liệu API cho dự án Web Bán Sách",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
    ],
  },
  // Chỉ định nơi chứa các comment @swagger (Controller hoặc Route)
  apis: ["./routes/*.js", "./controllers/*.js"], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Tạo đường dẫn xem tài liệu: http://localhost:3000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
// ---------------------------

// ---------------------------
// Routes
// ---------------------------

app.use("/api", apiRoutes);
app.use("/", webRoutes);

// ---------------------------
// 404 Handler
// ---------------------------
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ---------------------------
// Global Error Handler
// ---------------------------
app.use((err, req, res, next) => {
  logger.error(err);

  const status = err.status || 500;

  res.status(status).json({
    status,
    message: err.message || "Internal Server Error",
  });
});

// ---------------------------
// Start Server
// ---------------------------

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Swagger Docs available at http://localhost:${PORT}/api-docs`); // <--- Thêm log để dễ click
});