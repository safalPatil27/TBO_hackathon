import api from "./api";
import { Item } from "./itineraryUtils";

interface NodeMutations {
  title: string;
  location: string;
  days: number;
  budget: number;
  bearer: string;
}

export const createItinerary = async (data: NodeMutations) => {
  try {
    const response = await api.post(
      "/api/v1/itinerary/create",
      {
        title: data.title,
        location: data.location,
        days: data.days,
        budget: data.budget,
      },
      {
        headers: {
          Authorization: `Bearer ${data.bearer}`,
        },
      }
    );
    return response;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
};

export const getItineraries = async ({
  bearer,
  id,
}: {
  bearer: string;
  id: string;
}) => {
  try {
    const response = await api.get(`/api/v1/itinerary/getitinerary/${id}`, {
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
};

export const addDestinationToItinerary = async ({
  data,
  itineraryId,
  bearer,
}: {
  data: Item;
  itineraryId: string;
  bearer: string;
}) => {
  try {
    const response = await api.post(
      `/api/v1/itinerary/addDestination/`,
      {
        itinerary: data,
        itineraryId,
      },
      {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
      }
    );
    return response;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
};

export const getItinerariesByUser = async (bearer: string) => {
  try {
    const response = await api.get(`/api/v1/itinerary/getitinerarybyuser`, {
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
};
