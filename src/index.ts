import express, { Request, Response } from "express";
import { envVariables } from "./env";
import morganMiddleware from "./middlewares/morgan.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import proxy from "express-http-proxy";

const USERS_SERVICE_URL = "http://localhost:3000";
const ORDERS_SERVICE_URL = "http://localhost:3001";
const BILLINGS_SERVICE_URL = "http://localhost:3002";
const FEEDBACKS_SERVICE_URL = "http://localhost:8000";

const port = envVariables.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

app.get("/health", (req: Request, res: Response) => {
  res.send("I am healthy");
});

app.use(
  "/api/v1/auth",
  proxy(USERS_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`,
  })
);

app.get(
  "/api/v1/users/:uuid",
  authenticate,
  proxy(USERS_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/users/${req.params.uuid}`,
  })
);

app.post(
  "/api/v1/users",
  proxy(USERS_SERVICE_URL, {
    proxyReqPathResolver: () => "/api/v1/users",
  })
);

app.use(
  "/api/v1/orders",
  authenticate,
  proxy(ORDERS_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
      console.log(req.path);
      if (req.path === "/my/current") {
        return `/api/v1/orders/my/current/${req.body.user_uuid}`;
      }
      return `/api/v1/orders${req.url}`;
    },
  })
);

app.use(
  "/api/v1/order-items",
  authenticate,
  proxy(ORDERS_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/order-items${req.url}`,
  })
);

app.use(
  "/api/v1/billings",
  authenticate,
  proxy(BILLINGS_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/billings${req.url}`,
  })
);

app.use(
  "/api/v1/feedbacks",
  authenticate,
  proxy(FEEDBACKS_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/v1/feedbacks${req.url}`,
  })
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
