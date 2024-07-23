import express, { Request, Response, NextFunction } from "express";
import { envVariables } from "./env";
import morganMiddleware from "./middlewares/morgan.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import proxy from "express-http-proxy";

const {
  USERS_SERVICE_URL,
  ORDERS_SERVICE_URL,
  BILLINGS_SERVICE_URL,
  FEEDBACKS_SERVICE_URL,
  RESTAURANTS_SERVICE_URL,
  PORT
} = envVariables;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ message: "I am healthy" });
});

// Helper function for proxy routing
const createProxyMiddleware = (serviceUrl: string, pathPrefix: string) => {
  return proxy(serviceUrl, {
    proxyReqPathResolver: (req) => {
      const path = `${pathPrefix}${req.url}`;
      return path.replace(/\/+$/, ''); // Remove trailing slashes
    },
  });
};

// Users Service Routes
app.use("/api/v1/auth", createProxyMiddleware(USERS_SERVICE_URL, "/api/v1/auth"));
app.get("/api/v1/users/:uuid", authenticate, createProxyMiddleware(USERS_SERVICE_URL, "/api/v1/users"));
app.post("/api/v1/users", createProxyMiddleware(USERS_SERVICE_URL, "/api/v1/users"));
app.put("/api/v1/users/:uuid", authenticate, createProxyMiddleware(USERS_SERVICE_URL, "/api/v1/users"));

// Orders Service Routes
app.use("/api/v1/orders", authenticate, proxy(ORDERS_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    if (req.path === "/my/current") {
      return `/api/v1/orders/my/current/${req.body.user_uuid}`;
    }
    return `/api/v1/orders${req.url}`;
  },
}));
app.use("/api/v1/order-items", authenticate, createProxyMiddleware(ORDERS_SERVICE_URL, "/api/v1/order-items"));

// Billings Service Routes
app.use("/api/v1/billings", authenticate, createProxyMiddleware(BILLINGS_SERVICE_URL, "/api/v1/billings"));

// Feedbacks Service Routes
app.use("/api/v1/feedbacks", authenticate, createProxyMiddleware(FEEDBACKS_SERVICE_URL, "/api/v1/feedbacks"));

// Restaurants Service Routes
app.use("/api/v1/restaurants", authenticate, createProxyMiddleware(RESTAURANTS_SERVICE_URL, "/restaurants"));
app.use("/api/v1/meals", authenticate, createProxyMiddleware(RESTAURANTS_SERVICE_URL, "/meals"));
app.use("/api/v1/schedules", authenticate, createProxyMiddleware(RESTAURANTS_SERVICE_URL, "/schedules"));
app.use("/api/v1/meal-status", authenticate, createProxyMiddleware(RESTAURANTS_SERVICE_URL, "/meal-status"));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});