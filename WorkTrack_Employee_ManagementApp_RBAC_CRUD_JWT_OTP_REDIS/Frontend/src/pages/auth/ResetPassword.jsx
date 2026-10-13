import {
  useMutation,
} from "@tanstack/react-query";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  resetPasswordApi,
} from "../../api/forgot_reset_password";

const ResetPassword = () => {
  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      otp: "",
      password: "",
    });

  const {
    mutate,
    isPending,
    error,
  } = useMutation({
    mutationFn: ({
      email,
      otp,
      password,
    }) =>
      resetPasswordApi(
        email,
        otp,
        password,
      ),

    onSuccess: () => {
      navigate("/login");
    },
  });

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      }),
    );
  };

  const handleSubmit = (
    event,
  ) => {
    event.preventDefault();

    mutate(formData);
  };

  return (
    <>
      <h2>
        Reset Password
      </h2>

      <form
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          value={formData.otp}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Enter New Password"
          value={
            formData.password
          }
          onChange={handleChange}
          minLength={6}
          required
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "Resetting Password..."
            : "Reset Password"}
        </button>
      </form>

      {error && (
        <p>
          {error.response?.data
            ?.message ||
            error.message}
        </p>
      )}
    </>
  );
};

export default ResetPassword;