import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Circles } from 'react-loader-spinner';
import { useAuth } from '../contexts/AuthUserContexts';

const JoinItinerary = () => {
  const { link } = useParams(); // Get the link from URL params
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { state } = useAuth(); // Use context to get the user state (e.g., token)

  useEffect(() => {
    const joinItinerary = async () => {
      try {
        const token = state.user?.accessToken; // Assuming the token is stored in state.token
        if (!token) {
          setErrorMessage("User not authenticated");
          return;
        }

        const response = await axios.post(`http://localhost:8001/api/v1/itinerary/join-itinerary/${link}`, null, {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token in the Authorization header
          },
        });

        if (response.status === 200) {
          navigate('/dashboard'); // Redirect to dashboard on success
        } else {
          setErrorMessage("Not able to join the itinerary");
        }
      } catch (error) {
        setErrorMessage("Not able to join the itinerary");
      } finally {
        setIsLoading(false);
      }
    };

    joinItinerary();
  }, [link, state.user?.accessToken, navigate]);

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
