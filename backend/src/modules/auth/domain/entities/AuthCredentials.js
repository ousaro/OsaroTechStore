export const createRegistrationCommand = ({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  picture = "",
}) => {
  return Object.freeze({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    picture,
  });
};

export const createLoginCommand = ({ email, password }) => {
  return Object.freeze({ email, password });
};
