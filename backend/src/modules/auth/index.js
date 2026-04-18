import { env } from "../../config/env.js";
import { buildRegisterUserUseCase } from "./application/use-cases/registerUserUseCase.js";
import { buildLoginUserUseCase } from "./application/use-cases/loginUserUseCase.js";
import { createAuthInputPort } from "./ports/input/authInputPort.js";
import { buildVerifyAccessTokenUseCase } from "./application/use-cases/verifyAccessTokenUseCase.js";
import { createMongooseAuthUserRepository } from "./infrastructure/repositories/mongooseAuthUserRepository.js";
import { createJwtTokenService } from "./infrastructure/services/jwtTokenService.js";
import { createAuthHttpController } from "./infrastructure/http/authHttpController.js";
import { setupGooglePassport } from "./infrastructure/oauth/googlePassport.js";

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

export const passport = setupGooglePassport({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.CALLBACK_URL,
});

export const authUserAccess = {
  find(filter) {
    return authUserRepository.find(filter);
  },
  findById(id) {
    return authUserRepository.findById(id);
  },
  findByIdAndUpdate(id, updates, options) {
    return authUserRepository.findByIdAndUpdate(id, updates, options);
  },
  findByIdAndDelete(filter) {
    return authUserRepository.findByIdAndDelete(filter);
  },
};

export const verifyAccessToken = (authorizationHeader) => verifyAccessTokenUseCase({ authorizationHeader });
export { authInputPort };
