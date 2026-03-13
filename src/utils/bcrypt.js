import bcrypt from "bcrypt";

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

export const isValidPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};
