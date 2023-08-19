import "dotenv/config";
import express from "express";
import assertiveEnv from "./utils/assertiveEnv.js";
import errorHandler from "./error.js";
import orderRouter from "./routes/order.js";

const { PORT } = assertiveEnv("PORT");

const app = express();

app.use(express.json());

app.use("/order", orderRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
