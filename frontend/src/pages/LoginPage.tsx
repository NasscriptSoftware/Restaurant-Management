import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/features/slices/authSlice";
import { login } from "@/services/api";

const LoginSchema = Yup.object().shape({
  username: Yup.string().trim().required("Username is required"),
  password: Yup.string().trim().required("Password is required"),
});

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigate = (user: any) => {
    if (user.role === "driver") {
      setTimeout(() => {
        navigate("/driver");
      }, 50);
    } else {
      setTimeout(() => {
        navigate("/");
      }, 50);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await login(values);
        const user = response.data.user;
        const token = response.data.access;

        localStorage.setItem("token", token);
        localStorage.setItem("refresh", response.data.refresh);

        dispatch(loginSuccess({ user, token }));

        setIsLoading(false);
        handleNavigate(user);
      } catch (error: any) {
        setIsLoading(false);
        if (error.response?.status === 401) {
          formik.setErrors({ password: "Invalid username or password" });
        } else {
          console.error(`Failed to log in: ${error}`);
          formik.setErrors({
            password: "An error occurred. Please try again.",
          });
        }
      }
    },
  });

  return (
    <div className="flex items-center justify-center py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold">
          Sign in to your account
        </h2>
        <form className="mt-8 space-y-8" onSubmit={formik.handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                type="text"
                id="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                {...formik.getFieldProps("username")}
              />
              {formik.touched.username && formik.errors.username ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.username}
                </div>
              ) : null}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm py-3">
                  {formik.errors.password}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 group relative w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
