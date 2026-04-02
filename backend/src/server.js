import "dotenv/config";
import express from "express";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import recordRoutes from "./routes/record.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// Middleware
import { errorHandler } from "./middleware/errorHandler.js";

// Seed
import { seedRoles } from "./seed/seedRoles.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});

// ─── Routes ──────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─── Global Error Handler (must be last) ─────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────
async function startServer() {
    // Seed default roles
    await seedRoles();

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();
