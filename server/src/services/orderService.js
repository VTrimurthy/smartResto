import MenuItem from "../models/MenuItem.js";
import { isDemoMode } from "../config/env.js";
import { demoStore } from "./demoStore.js";
import { createValidationError, requireMinNumber, requireNonNegativeNumber } from "./validationService.js";

export const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

const toPlainObject = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value.toObject === "function") {
    return value.toObject();
  }

  return { ...value };
};

export const normalizeOrderPayload = async (payload, existingItem = null) => {
  const nextPayload = {
    ...toPlainObject(existingItem),
    ...payload,
  };
  const items = Array.isArray(nextPayload.items) ? nextPayload.items : [];

  if (!items.length) {
    throw createValidationError("At least one menu item is required for an order");
  }

  let catalog = [];
  if (nextPayload.restaurant) {
    if (isDemoMode) {
      const res = demoStore.list("MenuItem", { query: {} });
      const storeItems = Array.isArray(res) ? res : res?.items || [];
      catalog = storeItems.filter((item) => {
        const restId = typeof item.restaurant === "object" ? item.restaurant?._id : item.restaurant;
        return String(restId) === String(nextPayload.restaurant);
      });
    } else {
      catalog = await MenuItem.find({ restaurant: nextPayload.restaurant }).select("name price");
    }
  }

  nextPayload.items = items.map((item) => {
    const match = catalog.find((menuItem) => {
      if (item.menuItem) {
        return String(menuItem._id) === String(item.menuItem);
      }

      return menuItem.name.toLowerCase() === String(item.name || "").toLowerCase();
    });

    const quantity = Number(item.quantity || 1);
    const price = Number(item.price ?? match?.price ?? 0);

    requireMinNumber(quantity, `Quantity for item ${item.name || match?.name || "order item"}`, 1);
    requireNonNegativeNumber(price, `Price for item ${item.name || match?.name || "order item"}`);

    return {
      menuItem: item.menuItem || match?._id || null,
      name: item.name || match?.name || "Custom Item",
      quantity,
      price,
    };
  });

  const subtotal = nextPayload.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discount = Number(nextPayload.discount ?? 0);

  requireNonNegativeNumber(discount, "Discount");

  if (discount > subtotal) {
    throw createValidationError("Discount cannot exceed order subtotal");
  }

  nextPayload.orderNumber = nextPayload.orderNumber || generateOrderNumber();
  nextPayload.discount = discount;
  nextPayload.totalAmount = subtotal - discount;

  return nextPayload;
};
