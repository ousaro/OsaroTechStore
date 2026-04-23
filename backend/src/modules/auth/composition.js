import { buildRegisterUserUseCase } from "./application/commands/registerUserUseCase.js";
import { buildLoginUserUseCase } from "./application/commands/loginUserUseCase.js";
import { createAuthInputPort } from "./ports/input/authInputPort.js";
import { buildVerifyAccessTokenUseCase } from "./application/queries/verifyAccessTokenUseCase.js";
import { createAuthHttpController } from "./adapters/input/http/authHttpController.js";

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

export const createAuthModule = ({ authUserRepository, tokenService }) => {
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
  const httpHandlers = createAuthHttpController({
    authInputPort,
  });

  const listManagedUserProfiles = async () => {
    const accounts = await authUserRepository.findManagedAccountsSorted();
    return accounts.map(toManagedUserProfile);
  };

  const getManagedUserProfile = async (id) =>
    toManagedUserProfile(await authUserRepository.findById(id));

  const updateManagedUserProfile = async (id, updates) =>
    toManagedUserProfile(await authUserRepository.findByIdAndUpdate(id, updates, { new: true }));

  const removeManagedUserProfile = async (id) =>
    toManagedUserProfile(await authUserRepository.findByIdAndDelete({ _id: id }));

  const getManagedUserCredentials = async (id) => {
    const authUserRecord = await authUserRepository.findById(id);

    if (!authUserRecord) {
      return null;
    }

    return {
      _id: authUserRecord._id,
      password: authUserRecord.password,
    };
  };

  const updateManagedUserCredentials = async (id, updates) =>
    toManagedUserProfile(await authUserRepository.findByIdAndUpdate(id, updates, { new: true }));

  const verifyAccessToken = (authorizationHeader) => verifyAccessTokenUseCase({ authorizationHeader });

  return {
    ...httpHandlers,
    listManagedUserProfiles,
    getManagedUserProfile,
    updateManagedUserProfile,
    removeManagedUserProfile,
    getManagedUserCredentials,
    updateManagedUserCredentials,
    verifyAccessToken,
  };
};

let authModule;

const getConfiguredAuthModule = () => {
  if (!authModule) {
    throw new Error("Auth module has not been configured");
  }

  return authModule;
};

export const registerUserHandler = (...args) =>
  getConfiguredAuthModule().registerUserHandler(...args);

export const loginUserHandler = (...args) =>
  getConfiguredAuthModule().loginUserHandler(...args);

export const googleCallbackHandler = (...args) =>
  getConfiguredAuthModule().googleCallbackHandler(...args);

export const listManagedUserProfiles = (...args) =>
  getConfiguredAuthModule().listManagedUserProfiles(...args);

export const getManagedUserProfile = (...args) =>
  getConfiguredAuthModule().getManagedUserProfile(...args);

export const updateManagedUserProfile = (...args) =>
  getConfiguredAuthModule().updateManagedUserProfile(...args);

export const removeManagedUserProfile = (...args) =>
  getConfiguredAuthModule().removeManagedUserProfile(...args);

export const getManagedUserCredentials = (...args) =>
  getConfiguredAuthModule().getManagedUserCredentials(...args);

export const updateManagedUserCredentials = (...args) =>
  getConfiguredAuthModule().updateManagedUserCredentials(...args);

export const verifyAccessToken = (...args) =>
  getConfiguredAuthModule().verifyAccessToken(...args);

export const configureAuthModule = (dependencies) => {
  authModule = createAuthModule(dependencies);
  return authModule;
};
