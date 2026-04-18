import User from "../../../../models/userModel.js";

export const createMongooseAuthUserRepository = () => {
  return {
    register({ firstName, lastName, email, password, confirmPassword, picture }) {
      return User.register(firstName, lastName, email, password, confirmPassword, picture);
    },
    login({ email, password }) {
      return User.login(email, password);
    },
    async findUserIdOnly(userId) {
      const user = await User.findOne({ _id: userId }).select("_id");
      if (!user) {
        const error = new Error("Request is not authorized");
        error.statusCode = 401;
        throw error;
      }
      return user;
    },
  };
};
