export const HttpStatus = {
  OK: 200,
  Created: 201,
  No_Content: 204,

  Bad_Request: 400,
  Unauthorized: 401,
  Forbidden: 403,
  Not_Found: 404,
  Conflict: 409,
  Unprocessable_Content: 422,
  Too_Many_Requests: 429,

  InternalServer_Error: 500,
  Bad_Gateway: 502,
  Service_Unavailable: 503,
  Gateway_Timeout: 504,


} as const;

export const DatabaseErrorCode = {
  alreadyExists: "23505",
} as const;