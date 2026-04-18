export const createOrdersHttpController = ({
  getAllOrdersUseCase,
  getOrderByIdUseCase,
  addOrderUseCase,
  updateOrderUseCase,
  deleteOrderUseCase,
}) => {
  const getAllOrdersHandler = async (req, res) => {
    const payload = await getAllOrdersUseCase();
    return res.status(200).json(payload);
  };

  const getOrderByIdHandler = async (req, res) => {
    const payload = await getOrderByIdUseCase({ id: req.params.id });
    return res.status(200).json(payload);
  };

  const addOrderHandler = async (req, res) => {
    try {
      const payload = await addOrderUseCase(req.body);
      return res.status(201).json(payload);
    } catch (error) {
      const key = error.responseKey || "error";
      return res.status(error.statusCode || 500).json({ [key]: error.message });
    }
  };

  const updateOrderHandler = async (req, res) => {
    try {
      const payload = await updateOrderUseCase({
        id: req.params.id,
        updates: req.body,
      });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  };

  const deleteOrderHandler = async (req, res) => {
    try {
      const payload = await deleteOrderUseCase({ id: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      const key = error.responseKey || "error";
      return res.status(error.statusCode || 500).json({ [key]: error.message });
    }
  };

  return {
    getAllOrdersHandler,
    getOrderByIdHandler,
    addOrderHandler,
    updateOrderHandler,
    deleteOrderHandler,
  };
};
