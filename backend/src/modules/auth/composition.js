import { buildRegisterUserUseCase } from "./application/use-cases/registerUserUseCase.js";
import { buildLoginUserUseCase } from "./application/use-cases/loginUserUseCase.js";
import { createAuthInputPort } from "./ports/input/authInputPort.js";
import { buildVerifyAccessTokenUseCase } from "./application/use-cases/verifyAccessTokenUseCase.js";
import { createMongooseAuthUserRepository } from "./infrastructure/repositories/mongooseAuthUserRepository.js";
import { createJwtTokenService } from "./infrastructure/services/jwtTokenService.js";
import { createAuthHttpController } from "./infrastructure/http/authHttpController.js";

const authUserRepository = createMongooseAuthUserRepository();
const tokenService = createJwtTokenService();

const registerUserUseCase = buildRegisterUserUseCase({
  authUserRepository,
  tokenService,
});

const loginUserUseCase = buildLoginUserUseCase({
  authUserRepository,
  tokenService,
});

const verifyAccessTokenUseCase = buildVerifyAccessTokenUseCase({
  tokenService,
  authUserRepository,
});
const authInputPort = createAuthInputPort({
  registerUser: registerUserUseCase,
  loginUser: loginUserUseCase,
});

export const {
  registerUserHandler,
  loginUserHandler,
  googleCallbackHandler,
} = createAuthHttpController({
  authInputPort,
});

export const listNonAdminAccounts = () =>
  authUserRepository.find({ admin: false }).sort({ createdAt: -1 });

export const getAccountById = (id) => authUserRepository.findById(id);

export const updateAccountById = (id, updates) =>
  authUserRepository.findByIdAndUpdate(id, updates, { new: true });

export const deleteAccountById = (id) => authUserRepository.findByIdAndDelete({ _id: id });

export const verifyAccessToken = (authorizationHeader) => verifyAccessTokenUseCase({ authorizationHeader });
