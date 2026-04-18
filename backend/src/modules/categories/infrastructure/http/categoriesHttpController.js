export const createCategoriesHttpController = ({
  getAllCategoriesUseCase,
  addNewCategoryUseCase,
  deleteCategoryUseCase,
}) => {
  const getAllCategoriesHandler = async (req, res) => {
    const payload = await getAllCategoriesUseCase();
    return res.status(200).json(payload);
  };

  const addNewCategoryHandler = async (req, res) => {
    try {
      const payload = await addNewCategoryUseCase(req.body);
      return res.status(201).json(payload);
    } catch (error) {
      if (error.meta?.emptyFields) {
        return res.status(error.statusCode || 400).json({
          error: error.message,
          emptyFields: error.meta.emptyFields,
        });
      }
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  };

  const deleteCategoryHandler = async (req, res) => {
    try {
      const payload = await deleteCategoryUseCase({ id: req.params.id });
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  };

  return {
    getAllCategoriesHandler,
    addNewCategoryHandler,
    deleteCategoryHandler,
  };
};
