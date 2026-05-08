export const getSessionById = async (user, sessionId) => {
  return {
    data: {
      error: "Session lookup is not exposed in the current OpenAPI spec.",
      sessionId,
    },
    ok: false,
    status: 501,
  };
}
