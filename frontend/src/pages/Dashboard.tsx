import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthUserContexts";
import { useQuery } from "@tanstack/react-query";
import { getItinerariesByUser } from "../utils/nodeMutations";
import { useEffect } from "react";

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

const Dashboard = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
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
    error,
  } = useQuery({
    queryKey: ["GetItineraries"],
    queryFn: () => getItinerariesByUser(state.user?.accessToken || ""),
  });
  useEffect(() => {
    console.log(itinerary, "Get itineraries");
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
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => navigate("/itinerary")}
              >
                Create Itinerary
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {error && <td>Error fetching</td>}
                  {isLoading && <td>Loading...</td>}
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
