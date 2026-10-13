import axiosInstance from "./axios";

export const forgotPasswordApi =
  async (email) => {
    const response =
      await axiosInstance.post(
        "/api/auth/forgot-password",
        {
          email,
        },
      );

    return response.data;
  };

export const resetPasswordApi =
  async (
    email,
    otp,
    password,
  ) => {
    const response =
      await axiosInstance.post(
        "/api/auth/reset-password",
        {
          email,
          otp,
          password,
        },
      );

    return response.data;
  };