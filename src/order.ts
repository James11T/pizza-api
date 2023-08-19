import prisma from "./db.js";
import { v4 as uuid } from "uuid";
import { OrderStatus, OrderStatusEnum } from "./types.js";

const getOrderStatus = async (uuid: string) => {
  const order = await prisma.order.findFirstOrThrow({
    where: { uuid },
    select: { status: true },
  });

  return order.status as OrderStatus;
};

const getOrder = async (uuid: string) => {
  const order = await prisma.order.findFirstOrThrow({
    where: { uuid },
    include: {
      pizzas: {
        include: {
          toppings: true,
        },
      },
    },
  });

  return order;
};

type Pizza = {
  preset_id: string;
  toppings: string[];
};

const createOrder = async (pizzas: Pizza[]) => {
  return await prisma.order.create({
    data: {
      uuid: uuid(),
      status: OrderStatusEnum.WAITING,
      pizzas: {
        create: pizzas.map((pizza) => ({
          preset_id: pizza.preset_id,
          toppings: {
            create: pizza.toppings.map((topping) => ({
              topping_id: topping,
            })),
          },
        })),
      },
    },
  });
};

const updateOrder = async (uuid: string, status: OrderStatus) => {
  prisma.order.findFirstOrThrow({ where: { uuid } });

  return await prisma.order.update({
    where: { uuid },
    data: {
      status,
    },
  });
};

const getAllOrders = async (includeDone = false) => {
  const orders = await prisma.order.findMany({
    where: !includeDone
      ? {
          NOT: { status: "DONE" },
        }
      : undefined,
    include: {
      pizzas: {
        include: {
          toppings: true,
        },
      },
    },
  });

  return orders;
};

export { getOrderStatus, getOrder, createOrder, updateOrder, getAllOrders };
