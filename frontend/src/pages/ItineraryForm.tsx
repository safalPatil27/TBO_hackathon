import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getItinerary } from "../utils/flaskMutations";
import {
  addDestinationToItinerary,
  createItinerary,
} from "../utils/nodeMutations";
import { useAuth } from "../contexts/AuthUserContexts";
import { useState } from "react";
import { categoryMapping } from "../constants/data";
import { Circles } from "react-loader-spinner";
import { toast } from "react-toastify";
interface IFormData {
  title: string;
  days: number;
  location: string;
  activities: number[];
  sentence: string;
  children: boolean;
  budget: number;
}
const ItineraryForm = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [itineraryId, setItinerariesId] = useState<string>("");
  const [loader, setLoader] = useState(false);
  const [tag_array, setTag_array] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState: { isValid },
  } = useForm<IFormData>({
    defaultValues: {
      title: "",
      sentence: "",
      days: 0,
      location: "",
      activities: [],
      children: false,
      budget: 0,
    },
  });
  const updateDestinationsMutation = useMutation({
    mutationFn: addDestinationToItinerary,
    onSuccess: (data) => {
      console.log(data);
      setLoader(false);
      navigate(`/itinerary/${itineraryId}`);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong!";
      toast.error(errorMessage);
      setLoader(false);
    },
  });
  const flaskMutations = useMutation({
    mutationFn: getItinerary,
    onSuccess: (data) => {
      console.log(data);
      updateDestinationsMutation.mutate({
        data: data.data.itinerary,
        bearer: state.user?.accessToken || "",
        itineraryId: itinerariesId,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong!";
      toast.error(errorMessage);
      setLoader(false);
    },
  });
  const createItineraryMutation = useMutation({
    mutationFn: createItinerary,
    onSuccess: (data) => {
      console.log(data);
      setItinerariesId(data.data.data._id);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong!";
      toast.error(errorMessage);

      setLoader(false);
    },
  });

  const onSubmit = (data: IFormData) => {
    console.log("Form Data:", data);
    setLoader(true);
    createItineraryMutation.mutate({
      title: data.title,
      days: data.days,
      budget: data.budget,
      location: data.location,
      bearer: state.user?.accessToken || "",
    });
    flaskMutations.mutate({
      sentence: data.sentence,
      days: data.days,
      mainLocation: data.location,
      children: data.children,
      tag_array: tag_array,
    });
  };

  const handleCheckboxChange = (index: number, checked: boolean): void => {
    setTag_array((prevNumbers) =>
      prevNumbers.map((num, i) =>
        i === index ? (checked ? num + 1 : num - 1) : num
      )
    );
  };
  if (loader) {
    return (
      <div className="h-screen flex-col gap-4 flex w-full justify-center items-center bg-white">
        <Circles
          height="80"
          width="80"
          color="#000"
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        We are creating your itinerary
      </div>
    );
  }
  return (
    <div className="p-10 py-20 bg-gradient-to-b from-sky-900 flex flex-col items-center justify-center to-white min-h-screen">
      <div className="lg:w-2/5 mx-auto bg-cyan-800 p-12 my-12 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid place-content-center font-bold font-Playfair tracking-wider text-2xl mb-6">
            <div className="text-white">
              <p>Let's Design Your Itinerary</p>
            </div>
          </div>

          {/* Title Field */}
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              id="title"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="title"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-white peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Title
            </label>
            {errors.title && (
              <span className="text-red-500 text-sm">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Days Field */}
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="number"
              {...register("days", {
                required: "Days are required",
                min: { value: 1, message: "Days must be at least 1" },
                max: { value: 7, message: "Days must not exceed 7" },
              })}
              max={7}
              id="days"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="days"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Days
            </label>
            {errors.days && (
              <span className="text-red-500 text-sm">
                {errors.days.message}
              </span>
            )}
          </div>

          {/* Location Field */}
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              {...register("location", { required: "Location is required" })}
              id="location"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="location"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Location
            </label>
            {errors.location && (
              <span className="text-red-500 text-sm">
                {errors.location.message}
              </span>
            )}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              {...register("sentence", { required: "Sentence is required" })}
              id="sentence"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="sentence"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Description
            </label>
            {errors.sentence && (
              <span className="text-red-500 text-sm">
                {errors.sentence.message}
              </span>
            )}
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              {...register("budget", { required: "Budget is required" })}
              id="budget"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-white focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="budget"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Budget
            </label>
            {errors.budget && (
              <span className="text-red-500 text-sm">
                {errors.budget.message}
              </span>
            )}
          </div>

          {/* Activities (Multi-Checkbox) */}
          <div className="relative z-0 w-full mb-5 group">
            <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Select Interests
            </span>
            <div className="flex flex-col  gap-4">
              {categoryMapping.map(
                (
                  item: {
                    name: string;
                    places: string[];
                  },
                  index: number
                ) => (
                  <div key={index} className="w-full flex flex-col gap-4">
                    <h2 className="text-md text-white bg-green-500 w-fit px-4 py-2 rounded-full">
                      {" "}
                      {item.name}{" "}
                    </h2>
                    <div className="w-full gap-4 flex flex-wrap">
                      {item.places.map((place: string, idx: number) => (
                        <label
                          htmlFor={`${place}-${idx}`}
                          className="flex items-center gap-2 text-white"
                          key={idx}
                        >
                          <input
                            type="checkbox"
                            value={place}
                            {...register("activities")}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => handleCheckboxChange(index, e.target.checked)}
                            className="text-blue-500"
                            id={`${place}-${idx}`}
                          />
                          {place}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Children Included (Radio Buttons) */}
          <div className="relative z-0 w-full mb-5 group">
            <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Are children included?
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="radio"
                  {...register("children", {
                    required: "Please select an option",
                  })}
                  value="yes"
                  className="text-blue-600"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="radio"
                  {...register("children", {
                    required: "Please select an option",
                  })}
                  value="no"
                  className="text-blue-600"
                />
                No
              </label>
            </div>
            {errors.children && (
              <span className="text-red-500 text-sm">
                {errors.children.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="text-white bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800 focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center "
            disabled={!isValid}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItineraryForm;
