/**
 * Order Domain Entity.
 *
 * Fixed from original:
 *  - No longer imports PaymentStatus from payments/domain (cross-domain violation).
 *    Uses shared/domain/value-objects/PaymentStatus instead.
 *  - Money value object now carries currency.
 *  - Status transitions enforced via canTransitionTo() on the value object.
 *  - Immutable fields after placement enforced in update().
 *  - toPrimitives() returns a full flat projection (safe for read models).
 */

import { DomainValidationError }     from "../../../../shared/domain/errors/index.js";
import { assertNonEmptyString, assertNonEmptyArray } from "../../../../shared/kernel/assertions/index.js";
import { createOrderStatus, ORDER_STATUSES } from "../value-objects/OrderStatus.js";
import { createOrderLine }            from "../value-objects/OrderLine.js";
import { createAddress }              from "../value-objects/OrderLine.js";
import { createMoney }                from "../value-objects/Money.js";
import { createPaymentStatus, PAYMENT_STATUSES } from "../../../../shared/domain/value-objects/PaymentStatus.js";
import {
  OrderStatusTransitionNotAllowedError,
  ImmutableFieldsAfterOrderPlacementError,
} from "../errors/index.js";

const IMMUTABLE_AFTER_PLACEMENT = new Set(["ownerId", "orderLines", "currency"]);

export const createOrder = ({
  _id,
  ownerId,
  orderLines = [],
  deliveryAddress,
  currency = "USD",
  orderStatus,
  paymentStatus,
}) => {
  // ── Validate ───────────────────────────────────────────────────────────
  assertNonEmptyString(ownerId, "ownerId");
  assertNonEmptyArray(orderLines, "orderLines");

  const lines = orderLines.map((line) =>
    line.unitPrice?.toPrimitives
      ? line  // already a value object
      : createOrderLine({
          productId: line.productId,
          name:      line.name,
          price:     line.unitPrice?.amount ?? line.price,
          currency:  line.unitPrice?.currency ?? currency,
          quantity:  line.quantity,
        })
  );

  const address = deliveryAddress?.toPrimitives
    ? deliveryAddress
    : createAddress(deliveryAddress);

  const status = createOrderStatus(orderStatus ?? ORDER_STATUSES.PENDING);

  const pymtStatus = createPaymentStatus(paymentStatus ?? PAYMENT_STATUSES.PENDING);

  const total = lines.reduce(
    (acc, line) => acc.add(line.subtotal),
    createMoney({ amount: 0.01, currency })   // seed — will be replaced
  );

  // ── Re-compute total properly ──────────────────────────────────────────
  const computedTotal = lines
    .slice(1)
    .reduce((acc, line) => acc.add(line.subtotal), lines[0].subtotal);

  // ── Entity ────────────────────────────────────────────────────────────
  return Object.freeze({
    _id,
    ownerId,
    orderLines: lines,
    deliveryAddress: address,
    currency,
    orderStatus: status,
    paymentStatus: pymtStatus,
    totalPrice: computedTotal,

    // ── Behavior ────────────────────────────────────────────────────────

    updateStatus(nextStatus) {
      if (!status.canTransitionTo(nextStatus)) {
        throw new OrderStatusTransitionNotAllowedError(
          `Cannot transition order from "${status.value}" to "${nextStatus}"`
        );
      }
      return createOrder({
        _id,
        ownerId,
        orderLines: lines.map((l) => l.toPrimitives()),
        deliveryAddress: address.toPrimitives(),
        currency,
        orderStatus: nextStatus,
        paymentStatus: pymtStatus.value,
      });
    },

    confirmPayment(newPaymentStatus) {
      return createOrder({
        _id,
        ownerId,
        orderLines: lines.map((l) => l.toPrimitives()),
        deliveryAddress: address.toPrimitives(),
        currency,
        orderStatus: status.value,
        paymentStatus: newPaymentStatus,
      });
    },

    update(fields) {
      const immutableViolations = Object.keys(fields).filter((k) =>
        IMMUTABLE_AFTER_PLACEMENT.has(k)
      );
      if (immutableViolations.length > 0 && status.value !== ORDER_STATUSES.PENDING) {
        throw new ImmutableFieldsAfterOrderPlacementError(
          `Cannot update immutable fields after order is placed: ${immutableViolations.join(", ")}`
        );
      }
      return createOrder({
        _id,
        ownerId,
        orderLines: lines.map((l) => l.toPrimitives()),
        deliveryAddress: address.toPrimitives(),
        currency,
        orderStatus: status.value,
        paymentStatus: pymtStatus.value,
        ...fields,
      });
    },

    toPrimitives() {
      return {
        _id,
        ownerId,
        orderLines:      lines.map((l) => l.toPrimitives()),
        deliveryAddress: address.toPrimitives(),
        currency,
        orderStatus:     status.toPrimitives(),
        paymentStatus:   pymtStatus.toPrimitives(),
        totalPrice:      computedTotal.toPrimitives(),
      };
    },
  });
};
