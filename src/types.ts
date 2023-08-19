import { ZodObject } from "zod";

type ValidationSchema = ZodObject<{
  params?: any;
  body?: any;
  query?: any;
}>;

const OrderStatusEnum = {
  WAITING: "WAITING",
  PREPARING: "PREPARING",
  COOKING: "COOKING",
  DONE: "DONE",
} as const;

type OrderStatus = keyof typeof OrderStatusEnum;

export { OrderStatusEnum };
export type { ValidationSchema, OrderStatus };
