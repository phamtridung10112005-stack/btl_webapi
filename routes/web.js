import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Welcome to Web route </h1>");
});

export default router;
