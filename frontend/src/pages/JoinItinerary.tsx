import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Circles } from 'react-loader-spinner';
import { useAuth } from '../contexts/AuthUserContexts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getCurrentUser, joinItinerary } from '../utils/nodeMutations';
import { toast } from 'react-toastify';
import { parseHtmlError } from '../utils/parseHTMLErrors';

const JoinItinerary = () => {
  const { link } = useParams(); // Get the link from URL params
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const { state } = useAuth(); // Use context to get the user state (e.g., token)
  const token = state.user?.accessToken || "";
  
  const {
    data, isLoading: isDataFetching
  } = useQuery({
    queryKey: ['itinerary', link],
    queryFn: () => getCurrentUser(token),
  })
  const mutations = useMutation({
    mutationFn: joinItinerary,
    onSuccess: (data) => {
      console.log(data);
      toast.success("Itinerary joined successfully!");
      setErrorMessage("");
      setIsLoading(false);
      navigate('/dashboard');

    },
    onError: (error: any) => {
      console.log(error.json());
      console.log("error", error);
      
      
      const contentType = error.response.headers["content-type"];
      console.log(contentType, "content type");
      
      if (contentType.includes("text/html")) {
        const htmlResponse = error.response.data as string;
        const errorMessage = parseHtmlError(htmlResponse); // Parse HTML to extract error message
        toast.error(`API Error: ${errorMessage}`);
        setIsLoading(false);
        throw new Error(errorMessage);
      } else if (contentType.includes("application/json")) {
        // Handle JSON response
        const jsonResponse = error.response.data as { error: { message: string } };
        setIsLoading(false);
        toast.error(`API Error: ${jsonResponse.error.message}`);
        setErrorMessage(jsonResponse.error.message);
        throw new Error(jsonResponse.error.message);
      } else {
        // Handle other response types
        setIsLoading(false);
        toast.error("API Error: Unknown error format");
        setErrorMessage("Unknown error format");
        throw new Error("Unknown error format");
      }
      
      
    } 
    
  })
  useEffect(() => {
    if(data){
      console.log(data, "user data");
      
      setUserId(data.data.data._id);
    }
    console.log(userId);
    
  },[data, isDataFetching])
  useEffect(() => {
    const joinItinerary = async () => {
      setIsLoading(true);
      try {
        if(!token){
          setErrorMessage("Not able to join the itinerary! Please login");
          return;
        }else{
          mutations.mutate({ link: link || "", bearer: token || "", userId, access: "edit" });
        }
      } catch (error) {
        setErrorMessage("Not able to join the itinerary");
      } finally {
        setIsLoading(false);
      }
    };

    joinItinerary();
  }, [token, link, userId,data]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isLoading ? (
        <div className="text-center bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
          <p className="text-lg font-medium text-gray-800 mb-4">We are joining you to the itinerary...</p>
          <Circles
            height="50"
            width="50"
            color="#4CAF50"
            ariaLabel="circles-loading"
            wrapperClass="mb-4"
            visible={true}
          />
          <p className="text-gray-500">Please wait...</p>
        </div>
      ) : (
        <div className="text-center bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
          {errorMessage ? (
            <>
              <p className="text-xl font-semibold text-red-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <p className="text-xl font-semibold text-green-600">You have successfully joined the itinerary!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinItinerary;
