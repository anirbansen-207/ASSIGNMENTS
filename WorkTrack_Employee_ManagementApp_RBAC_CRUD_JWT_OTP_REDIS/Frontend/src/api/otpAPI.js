import axiosInstance from "./axios";

export const verifyOTPApi =
  async (email, otp) => {
    const response =
      await axiosInstance.post(
        "/api/auth/verifyOTP",
        {
          email,
          otp,
        },
      );

    return response.data.user;
  };

export const resendOTPApi =
  async (email) => {
    const response =
      await axiosInstance.post(
        "/api/auth/resendOTP",
        {
          email,
        },
      );

    return response.data;
  };