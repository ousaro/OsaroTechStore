/**
 * SHARED KERNEL — Port Assertions
 *
 * Mirror of backend port validation. Called during composition to
 * guarantee every output port is fully implemented before modules run.
 *
 * Usage:
 *   assertPort('ProductRepositoryPort', adapter, ['getAll','getById','create','update','delete'])
 */

export function assertPort(portName, adapter, requiredMethods) {
  if (!adapter || typeof adapter !== "object") {
    throw new Error(`[PortAssertion] ${portName}: adapter is null or not an object.`);
  }
  const missing = requiredMethods.filter((m) => typeof adapter[m] !== "function");
  if (missing.length > 0) {
    throw new Error(
      `[PortAssertion] ${portName}: missing methods → ${missing.join(", ")}`
    );
  }
}

export function assertInputPort(portName, port, requiredMethods) {
  assertPort(`InputPort(${portName})`, port, requiredMethods);
}
