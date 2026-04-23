import { buildRegisterUserUseCase } from "./application/commands/registerUserUseCase.js";
import { buildLoginUserUseCase } from "./application/commands/loginUserUseCase.js";
import { createAuthInputPort } from "./ports/input/authInputPort.js";
import { buildVerifyAccessTokenUseCase } from "./application/queries/verifyAccessTokenUseCase.js";
import { createMongooseAuthUserRepository } from "./adapters/output/repositories/mongooseAuthUserRepository.js";
import { createJwtTokenService } from "./adapters/output/services/jwtTokenService.js";
import { createAuthHttpController } from "./adapters/input/http/authHttpController.js";

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

const toManagedUserProfile = (authUserRecord) => {
  if (!authUserRecord) {
    return null;
  }

  const {
    password: _password,
    ...managedUserProfile
  } = authUserRecord;

  return managedUserProfile;
};

export const listManagedUserProfiles = async () => {
  const accounts = await authUserRepository.findManagedAccountsSorted();
  return accounts.map(toManagedUserProfile);
};

export const getManagedUserProfile = async (id) =>
  toManagedUserProfile(await authUserRepository.findById(id));

export const updateManagedUserProfile = async (id, updates) =>
  toManagedUserProfile(await authUserRepository.findByIdAndUpdate(id, updates, { new: true }));

export const removeManagedUserProfile = async (id) =>
  toManagedUserProfile(await authUserRepository.findByIdAndDelete({ _id: id }));

export const getManagedUserCredentials = async (id) => {
  const authUserRecord = await authUserRepository.findById(id);

  if (!authUserRecord) {
    return null;
  }

  return {
    _id: authUserRecord._id,
    password: authUserRecord.password,
  };
};

export const updateManagedUserCredentials = async (id, updates) =>
  toManagedUserProfile(await authUserRepository.findByIdAndUpdate(id, updates, { new: true }));

export const verifyAccessToken = (authorizationHeader) => verifyAccessTokenUseCase({ authorizationHeader });
