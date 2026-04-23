import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { createAddress } from "../value-objects/Address.js";
import { createMoney } from "../value-objects/Money.js";
import { createOrderLines } from "../value-objects/OrderLine.js";
import { createOrderStatus } from "../value-objects/OrderStatus.js";
import { createPaymentStatus } from "../value-objects/PaymentStatus.js";
import { assertString } from "../validation/orderValidation.js";

export const createOrder = ({
  ownerId,
  products,
  totalPrice,
  status,
  address,
  paymentMethod,
  paymentStatus,
  paymentReference,
  transactionId,
}) => {
  assertString(ownerId, "ownerId is required");
  const orderLines = createOrderLines(products);
  assertString(paymentMethod, "paymentMethod is required");
  const stablePaymentReference = paymentReference ?? transactionId;
  assertString(stablePaymentReference, "paymentReference is required");
  const orderAddress = createAddress(address);
  const orderTotalPrice = createMoney(totalPrice);
  const orderStatus = createOrderStatus(status);
  const orderPaymentStatus = createPaymentStatus(paymentStatus);

  const props = {
    ownerId,
    products: orderLines,
    totalPrice: orderTotalPrice,
    status: orderStatus,
    address: orderAddress,
    // paymentMethod stays on the order as checkout intent; provider execution stays in payments.
    paymentMethod,
    paymentStatus: orderPaymentStatus,
    paymentReference: stablePaymentReference,
  };

  return Object.freeze({
    ...props,
    toPrimitives() {
      return {
        ...props,
        products: props.products.map((line) => line.toPrimitives()),
        totalPrice: props.totalPrice.toPrimitives(),
        status: props.status.toPrimitives(),
        address: props.address.toPrimitives(),
        paymentStatus: props.paymentStatus.toPrimitives(),
      };
    },
  });
};

const ALLOWED_ORDER_STATUS_TRANSITIONS = {
  pending: new Set(["paid", "cancelled"]),
  paid: new Set(["processing", "cancelled"]),
  processing: new Set(["shipped", "cancelled"]),
  shipped: new Set(["delivered"]),
  delivered: new Set([]),
  cancelled: new Set([]),
};

export const transitionOrderStatus = (currentOrder, nextStatus) => {
  const currentStatus = createOrderStatus(currentOrder.status).toPrimitives();
  const targetStatus = createOrderStatus(nextStatus).toPrimitives();

  if (currentStatus === targetStatus) {
    return createOrderStatus(targetStatus);
  }

  const allowedNextStatuses = ALLOWED_ORDER_STATUS_TRANSITIONS[currentStatus] ?? new Set();

  if (!allowedNextStatuses.has(targetStatus)) {
    throw new DomainValidationError(
      `Invalid order status transition from ${currentStatus} to ${targetStatus}`
    );
  }

  return createOrderStatus(targetStatus);
};

export const markOrderAsPaid = (currentOrder) =>
  transitionOrderStatus(currentOrder, "paid");

export const startOrderProcessing = (currentOrder) =>
  transitionOrderStatus(currentOrder, "processing");

export const shipOrder = (currentOrder) =>
  transitionOrderStatus(currentOrder, "shipped");

export const deliverOrder = (currentOrder) =>
  transitionOrderStatus(currentOrder, "delivered");

export const cancelOrder = (currentOrder) =>
  transitionOrderStatus(currentOrder, "cancelled");

export const createOrderUpdatePatch = (updates) => {
  const patch = { ...updates };

  if (patch.totalPrice !== undefined) {
    patch.totalPrice = createMoney(patch.totalPrice);
  }

  if (patch.status !== undefined) {
    patch.status = createOrderStatus(patch.status);
  }

  if (patch.paymentMethod !== undefined) {
    assertString(patch.paymentMethod, "paymentMethod is required");
  }

  if (patch.paymentReference !== undefined) {
    assertString(patch.paymentReference, "paymentReference is required");
  }

  if (patch.transactionId !== undefined) {
    assertString(patch.transactionId, "transactionId is required");
  }

  if (patch.transactionId !== undefined && patch.paymentReference === undefined) {
    patch.paymentReference = patch.transactionId;
  }

  if (patch.paymentStatus !== undefined) {
    patch.paymentStatus = createPaymentStatus(patch.paymentStatus);
  }

  if (patch.address !== undefined) {
    patch.address = createAddress(patch.address);
  }

  if (patch.products !== undefined) {
    patch.products = createOrderLines(patch.products);
  }

  delete patch.transactionId;
  delete patch.paymentDetails;

  return Object.freeze({
    toPrimitives() {
      return {
        ...patch,
        ...(patch.products
          ? { products: patch.products.map((line) => line.toPrimitives()) }
          : {}),
        ...(patch.totalPrice ? { totalPrice: patch.totalPrice.toPrimitives() } : {}),
        ...(patch.status ? { status: patch.status.toPrimitives() } : {}),
        ...(patch.address ? { address: patch.address.toPrimitives() } : {}),
        ...(patch.paymentStatus ? { paymentStatus: patch.paymentStatus.toPrimitives() } : {}),
      };
    },
  });
};
