const wrapSuccessResult = (res, successMessage, data) =>
  res.status(200).json({
    status: "success",
    message: successMessage,
    data: data,
  });

const wrapFailResult = (res, failMessage, errCode) => {
  if (!errCode) {
    errCode = 400;
  }
  res.status(errCode).json({
    status: "fail",
    message: failMessage,
  });
};

const AUTHENTICATE_ERR_CODE = 401;
const AUTHORIZED_ERR_CODE = 403;
const BAD_REQ_ERR_CODE = 400;
const CONFLICT_ERR_CODE = 409;
const SUCCESS_CODE = 201;
const OK_CODE = 200;

module.exports = {
  wrapSuccessResult,
  wrapFailResult,
  AUTHENTICATE_ERR_CODE,
  AUTHORIZED_ERR_CODE,
  BAD_REQ_ERR_CODE,
  CONFLICT_ERR_CODE,
  SUCCESS_CODE,
  OK_CODE,
};
