import api from "./api";
interface User {
  email: string;
  password: string;
  confirmPassword: string;
}

interface UserLogin {
  email: string;
  password: string;
}

export const registerUser = async (user: User) => {
  try {
    const response = await api.post("/api/v1/user/register", {
      email: user.email,
      username: user.email,
      password: user.password,
    });
    return response;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
};

export const loginUser = async (user: UserLogin) => {
  try {
    const response = await api.post("/api/v1/user/login", {
      email: user.email,
      password: user.password,
    });
    return response;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
};
