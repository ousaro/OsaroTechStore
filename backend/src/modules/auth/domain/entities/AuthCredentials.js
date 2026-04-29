// AuthCredentials — domain commands for auth operations
export const createRegistrationCommand = ({
  firstName, lastName, email, password, confirmPassword, picture = "",
}) =>
  Object.freeze({ firstName, lastName, email, password, confirmPassword, picture });

export const createLoginCommand = ({ email, password }) =>
  Object.freeze({ email, password });
