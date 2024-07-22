type BaseResponse = {
  data: object | null;
  message: string;
  success: boolean;
  statusCode: number;
};

export const createBaseResponse = (
  data: object | null = null,
  message: string,
  success: boolean = true,
  statusCode: number = 200
): BaseResponse => {
  const response: BaseResponse = {
    data,
    message,
    success,
    statusCode,
  };

  return response;
};
