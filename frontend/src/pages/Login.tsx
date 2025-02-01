import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdEye } from "react-icons/io";
import { FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthUserContexts";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../utils/register";
interface IFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [state.isAuthenticated, navigate]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormData>();
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Logged in successfully!", data);
      localStorage.setItem("accessToken", data.data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.data.refreshToken);
      localStorage.setItem("email", data.data.data.email);
      dispatch({
        type: "LOGIN",
        payload: {
          username: data.data.data.user.username,
          email: data.data.data.user.email,
          accessToken: data.data.data.accessToken,
          refreshToken: data.data.data.refreshToken,
        },
      });
      toast.success("Logged in successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: IFormData) => {
    console.log(data);
    mutation.mutate({
      email: data.email,
      password: data.password,
    });
    // toast.success('Logged in successfully!');
  };
  useEffect(() => {
    console.log(state);
  }, [state]);

  return (
    <div className="bg-gradient-to-b from-sky-900">
      <section className=" min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-cyan-800 rounded-lg shadow  ">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl ">
              {"Login to your account"}
            </h1>

            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-white "
                >
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={` border text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5    ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="name@company.com"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-white "
                >
                  Password
                </label>
                <div className="flex items-center gap-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    })}
                    className={`border text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <span
                    className="absolute right-2  cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IoMdEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="text-white bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800 focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
              >
                {"Login"}
              </button>
            </form>

            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              {"Don't have an account?"}{" "}
              <Link
                to={"/register"}
                className="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
