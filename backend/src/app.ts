import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { setupSwagger } from "./utils/swagger";

const app = express();

const whitelist = [process.env.FRONTEND_URL || "http://localhost:5173"];
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    if (!origin || whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};


app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (_req, res) => res.redirect("/api"));

setupSwagger(app);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
