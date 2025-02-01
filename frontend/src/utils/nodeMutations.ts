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
  console.log(data, itineraryId, bearer, "data");

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

export const deleteItinerary = async ({
  bearer,
  id,
}: {
  bearer: string;
  id: string;
}) => {
  try {
    const response = await api.delete(`/api/v1/itinerary/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
    });
    return { response, id };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  }
};

interface Hotel {
  countrycode: string;
  location: string;
  adults: number;
  children: number;
  star_rating: string;
  start_date: string;
  end_date: string;
  No_of_rooms: number;
}

export const displayHotels = async ({
  data,
  bearer,
}: {
  data: Hotel;
  bearer: string;
}) => {
  try {
    const response = await api.post(
      `/api/v1/itinerary/displayHotel/`,
      {
        countrycode: data.countrycode,
        location: data.location,
        adults: data.adults,
        children: data.children,
        star_rating: data.star_rating,
        start_date: data.start_date,
        end_date: data.end_date,
        No_of_rooms: data.No_of_rooms,
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


export const joinItinerary = async ({link, bearer, userId, access}: {
  link: string;
  bearer: string;
  userId: string;
  access: string
}) => {
  try {
    const response = await api.post(
      `/api/v1/itinerary/join-itinerary/${link}`,
      {
        userId,
        status: access
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
      error.response || "An unexpected error occurred"
    );
  }
};

export const getCurrentUser = async (bearer: string) => {
  try {
    const response = await api.get(`/api/v1/user/current-user`, {
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