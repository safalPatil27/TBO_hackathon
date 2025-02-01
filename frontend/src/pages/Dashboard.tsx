import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthUserContexts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteItinerary, getItinerariesByUser } from "../utils/nodeMutations";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Sidebar = () => (
  <div className=" w-64 h-full flex flex-col p-4 space-y-6">
    <h1 className="text-xl font-bold">Admin Dashboard</h1>
    <nav className="flex flex-col space-y-4">
      <a href="#" className="text-gray-300 hover:text-white">
        Dashboard
      </a>
      <a href="#" className="text-gray-300 hover:text-white">
        User Info
      </a>
      <a href="#" className="text-gray-300 hover:text-white">
        Itinerary
      </a>
      <a href="#" className="text-gray-300 hover:text-white">
        Settings
      </a>
    </nav>
  </div>
);

const Header = ({
  user,
  handleLogout,
}: {
  user: string;
  handleLogout: () => void;
}) => {
  return (
    <header className="  h-16 flex items-center px-6 justify-between">
      <h2 className="text-2xl font-semibold">Welcome, {user}</h2>
      <button
        className="bg-white px-4 py-2 rounded-md hover:bg-gray-600"
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  );
};
interface Itinerary {
  _id: string;
  Days: number;
  budget: number;
  location: string;
  permissions: { userId: string; access: string }[];
  userId: string;
  destinations: string[];
  hotels: string[];
  title: string;
  updatedAt: string;
  createdAt: string;
}
const Dashboard = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const hanldeLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("user");

    dispatch({ type: "LOGOUT" });
  };
  const {
    data: itinerary,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["GetItineraries"],
    queryFn: () => getItinerariesByUser(state.user?.accessToken || ""),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteItinerary,
    onSuccess: (data) => {
      console.log("deleted", data.id);
      refetch();
      toast.success("Itinerary deleted successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  })
  useEffect(() => {
    console.log(itinerary, "Get itineraries");
    if (itinerary) {
      setItineraries(itinerary.data.data);
    }
  }, [itinerary, isLoading]);
  return (
    <div className="flex bg-gradient-to-b from-sky-900 pt-32">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={state.user?.name || ""} handleLogout={hanldeLogout} />
        <main className="p-6 space-y-6">
          <section className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">User Information</h3>
            <div className="space-y-2">
              <p>
                <span className="font-bold">Name:</span> {state.user?.name}
              </p>
              <p>
                <span className="font-bold">Email:</span> {state.user?.email}
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg w-full">
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="text-xl font-semibold ">Itinerary</h3>
              <button
                className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 text-white"
                onClick={() => navigate("/itinerary")}
              >
                Create Itinerary
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Title</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Budget</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3">Delete</th>
                  <th className="p-3">Edit</th>
                </tr>
              </thead>
              <tbody>
                {itineraries.map((itinerary) => (
                  <tr key={itinerary._id}>
                    <td className="p-3">{itinerary.title}</td>
                    <td className="p-3">{itinerary.location}</td>
                    <td className="p-3">{itinerary.Days}</td>
                    <td className="p-3">{itinerary.budget}</td>
                    <td className="p-3">{itinerary.createdAt}</td>
                    <td className="p-3">{itinerary.updatedAt}</td>
                    <td className="p-3">
                      <button
                        className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 text-white"
                        onClick={() => deleteMutation.mutate({
                          id: itinerary._id,
                          bearer: state.user?.accessToken || ""
                        })}
                      >
                        Delete
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 text-white"
                        onClick={() => navigate(`/itinerary/${itinerary._id}`)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
