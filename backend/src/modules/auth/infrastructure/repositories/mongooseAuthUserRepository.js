import UserModel from "../persistence/userModel.js";

export const createMongooseAuthUserRepository = () => {
  return {
    register({ firstName, lastName, email, password, confirmPassword, picture }) {
      return UserModel.register(firstName, lastName, email, password, confirmPassword, picture);
    },
    login({ email, password }) {
      return UserModel.login(email, password);
    },
    async findUserIdOnly(userId) {
      const user = await UserModel.findOne({ _id: userId }).select("_id");
      if (!user) {
        const error = new Error("Request is not authorized");
        error.statusCode = 401;
        throw error;
      }
      return user;
    },
  };
};
