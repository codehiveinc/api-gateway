import { JwtPayload, verify } from "jsonwebtoken";

type DecodedTokenModel = {
  uuid: string;
  email: string;
};

export const verifyToken = (token: string, secretKey: string): boolean => {
  try {
    verifyToken(token, secretKey);
    return true;
  } catch (error) {
    return false;
  }
};

export const decodeToken = (token: string, secretKey: string): DecodedTokenModel => {
  const payload: JwtPayload = verify(token, secretKey) as JwtPayload;

  return {
    uuid: payload.uuid,
    email: payload.email,
  };
};
