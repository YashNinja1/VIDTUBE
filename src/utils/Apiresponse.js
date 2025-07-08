class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    ((this.data = data),
      (this.statusCode = statusCode),
      (this.message = message),
      (this.sucess = statusCode < 300));
  }
}
export {ApiResponse};
