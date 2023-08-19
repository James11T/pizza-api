import { Router } from "express";
import {
  getOrder,
  createOrder,
  updateOrder,
  getOrderStatus,
  getAllOrders,
} from "../order.js";
import { z } from "zod";
import { validate } from "../utils/validate.js";
import { APIError, asyncController } from "../error.js";
import { OrderStatus } from "../types.js";

const orderRouter = Router();

const getOrderSchema = z.object({
  params: z.object({
    uuid: z.string().uuid(),
  }),
});

orderRouter.get(
  "/",
  asyncController(async (req, res) => {
    const orders = await getAllOrders(true);

    return res.json(
      orders.map((order) => ({
        uuid: order.uuid,
        status: order.status,
        pizzas: order.pizzas.map((pizza) => ({
          preset_id: pizza.preset_id,
          toppings: pizza.toppings.map((topping) => topping.topping_id),
        })),
      }))
    );
  })
);

orderRouter.get(
  "/:uuid",
  asyncController(async (req, res, next) => {
    const data = await validate(getOrderSchema, req);

    let order: Awaited<ReturnType<typeof getOrder>>;
    try {
      order = await getOrder(data.params.uuid);
    } catch (error) {
      return next(new APIError(404, "No order with the given ID was found."));
    }

    return res.json({
      uuid: order.uuid,
      status: order.status,
      pizzas: order.pizzas.map((pizza) => ({
        preset: pizza.preset_id,
        toppings: pizza.toppings.map((topping) => topping.topping_id),
      })),
    });
  })
);

orderRouter.get(
  "/:uuid/status",
  asyncController(async (req, res, next) => {
    const data = await validate(getOrderSchema, req);

    let status: OrderStatus;
    try {
      status = await getOrderStatus(data.params.uuid);
    } catch (error) {
      return next(new APIError(404, "No order with the given ID was found."));
    }

    return res.json({
      status,
    });
  })
);

const createOrderSchema = z.object({
  body: z.object({
    pizzas: z.array(
      z.object({
        preset_id: z.string(),
        toppings: z.array(z.string()),
      })
    ),
  }),
});

orderRouter.post(
  "/",
  asyncController(async (req, res, next) => {
    const data = await validate(createOrderSchema, req);

    let newOrder: Awaited<ReturnType<typeof createOrder>>;
    try {
      newOrder = await createOrder(data.body.pizzas);
    } catch (error) {
      return next(new APIError(500, "Failed to create order"));
    }

    return res.json({ uuid: newOrder.uuid });
  })
);

const updateOrderSchema = z.object({
  params: z.object({
    uuid: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(["WAITING", "PREPARING", "COOKING", "DONE"]),
  }),
});

orderRouter.patch(
  "/:uuid",
  asyncController(async (req, res, next) => {
    const data = await validate(updateOrderSchema, req);

    let updatedOrder: Awaited<ReturnType<typeof updateOrder>>;
    try {
      updatedOrder = await updateOrder(data.params.uuid, data.body.status);
    } catch (error) {
      return next(new APIError(500, "Failed to update order"));
    }

    return res.json({
      uuid: updatedOrder.uuid,
      status: updatedOrder.status,
    });
  })
);

export default orderRouter;
