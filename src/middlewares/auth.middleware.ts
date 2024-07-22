import { NextFunction, Request, Response } from "express";
import { envVariables } from "../env";
import { decodeToken, verifyToken } from "../utils/jwt.util";
import { createBaseResponse } from "../utils/base-response-builder.util";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = (req.headers.authorization || "").replace(
    /^Bearer\s/,
    ""
  );

  if (!accessToken) {
    const response = createBaseResponse(
      null,
      "Required access token",
      false,
      401
    );

    return res.status(response.statusCode).json(response);
  }

  const accessTokenSecret = envVariables.ACCESS_TOKEN_SECRET;

  try {
    const decodedToken = decodeToken(accessToken, accessTokenSecret);

    req.body.user_uuid = decodedToken.uuid;
  } catch (error) {
    const response = createBaseResponse(
      null,
      "Invalid access token",
      false,
      401
    );

    return res.status(response.statusCode).json(response);
  }

  next();
};
