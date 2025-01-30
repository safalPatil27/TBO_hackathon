import { flaskServerAPI } from "./api";

interface FlaskInputs {
  sentence: string;
  tag_array: number[];
  days: number;
  mainLocation: string;
  children: boolean;
}

export const getItinerary = async (inputs: FlaskInputs) => {
  try {
    const response = await flaskServerAPI.post("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputs),
    });
    return response;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred" + error
    );
  }
};
