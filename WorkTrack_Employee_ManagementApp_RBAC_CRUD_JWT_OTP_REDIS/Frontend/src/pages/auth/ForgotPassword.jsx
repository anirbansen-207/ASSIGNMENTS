import {
  useMutation,
} from "@tanstack/react-query";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  forgotPasswordApi,
} from "../../api/forgot_reset_password";

const ForgotPassword = () => {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const {
    mutate,
    isPending,
    error,
  } = useMutation({
    mutationFn:
      forgotPasswordApi,

    onSuccess: () => {
      navigate(
        "/reset-password",
      );
    },
  });

  const handleSubmit = (
    event,
  ) => {
    event.preventDefault();

    mutate(email);
  };

  return (
    <>
      <h2>
        Forgot Password
      </h2>

      <form
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value,
            )
          }
          required
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "Sending OTP..."
            : "Send OTP"}
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

export default ForgotPassword;