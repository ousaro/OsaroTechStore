export const toPaymentCheckoutRedirectDto = (paymentWorkflow) => {
  return {
    url: paymentWorkflow.url,
  };
};

export const toPaymentWorkflowDto = (paymentWorkflow) => {
  return {
    id: paymentWorkflow.id,
    ...(paymentWorkflow.paymentReference
      ? { paymentReference: paymentWorkflow.paymentReference }
      : {}),
    ...(paymentWorkflow.url ? { url: paymentWorkflow.url } : {}),
    provider: paymentWorkflow.provider,
    workflowType: paymentWorkflow.workflowType,
    ...(paymentWorkflow.providerStatus
      ? { providerStatus: paymentWorkflow.providerStatus }
      : {}),
    paymentStatus: paymentWorkflow.paymentStatus,
  };
};
