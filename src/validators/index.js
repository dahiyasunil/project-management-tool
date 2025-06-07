import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 4 })
      .withMessage("Username should be atleast 4 character long")
      .isLength({ max: 12 })
      .withMessage("Username cannot exceed 12 character"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isStrongPassword()
      .withMessage(
        "Password must be 8 character long, containing 1 upper case, 1 lower case, 1 numberic and 1 special character."
      ),
    body("fullname")
      .notEmpty()
      .withMessage("User full name is required")
      .isLength({ min: 4 })
      .withMessage("Name should be atleast 2 character long")
      .isLength({ max: 50 })
      .withMessage("Name should be atleast 2 character long"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password cannot be empty"),
  ];
};

const resendVerificationEmailValidator = () => {
  return [body("email").isEmail().withMessage("Invalid email")];
};

export {
  userRegistrationValidator,
  userLoginValidator,
  resendVerificationEmailValidator,
};
