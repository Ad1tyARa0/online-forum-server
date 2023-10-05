import { User } from "./User";
import bcrypt from "bcryptjs";
import { isPasswordValid } from "../validators/password";
import { isEmailValid } from "../validators/email";

const saltRounds = 10;

export class UserResult {
  constructor(public messages?: Array<string>, public user?: User) {}
}

export const register = async (
  email: string,
  userName: string,
  password: string
): Promise<UserResult> => {
  const result = isPasswordValid(password);

  if (!result.isValid) {
    return {
      messages: [
        "Passwords must have a minimum length of 8, atleast one uppercase, one number and one symbol",
      ],
    };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailErrorMessage = isEmailValid(trimmedEmail);

  if (emailErrorMessage) {
    return {
      messages: [emailErrorMessage],
    };
  }

  const salt = await bcrypt.genSalt(saltRounds);

  const hashedPassword = await bcrypt.hash(password, salt);

  const userEntity = await User.create({
    email: trimmedEmail,
    userName,
    password: hashedPassword,
  }).save();

  userEntity.password = "";

  return {
    user: userEntity,
  };
};

export const login = async (
  userName: string,
  password: string
): Promise<UserResult> => {
  const user = await User.findOne({
    where: { userName },
  });

  if (!user) {
    return {
      messages: [userNotFound(userName)],
    };
  }

  if (!user.confirmed) {
    return {
      messages: ["User has not confirmed their registration email yet."],
    };
  }

  const passwordMatch = await bcrypt.compare(password, user?.password);

  if (!passwordMatch) {
    return {
      messages: ["Password is invalid."],
    };
  }

  return {
    user: user,
  };
};

function userNotFound(userName: string) {
  return `User with userName ${userName} not found.`;
}
