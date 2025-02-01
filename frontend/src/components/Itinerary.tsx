import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { data as itineraryData } from "../constants/data";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import {
  Item,
  MAX_LOCATIONS_PER_DAY,
  MAX_RESTAURANTS_PER_DAY,
  sortItems,
  updateItemIds,
} from "../utils/itineraryUtils";
import ItineraryListItem from "./Itinerary/ItineraryListItem";
import { Link, useParams } from "react-router-dom";
import HotelBookingForm from "./Itinerary/HotelBookingForm";
import { Circles } from "react-loader-spinner";
const socket = io("http://localhost:8001");

interface ItineraryProps {
  title: string;
}

type ItineraryData = Item[][];
interface ItineraryInfo {
  _id: string;
  days: number;
  budget: number;
  location: string;
  permissions: { userId: string; access: string }[];
  title: string;
}
export interface IHotel {
  countrycode: string;
  location: string;
  adults: number;
  children: number;
  star_rating: string;
  start_date: string;
  end_date: string;
  No_of_rooms: number;
}
export interface IHotels {
  Address: string;
  CityName: string;
  CountryCode: string;
  CountryName: string;
  Currency: string;
  HotelCode: string;
  HotelName: string;
  HotelRating: string;
  latitude: string;
  longitude: string;
  TotalFare?: number;
  TotalTax?: number;
  Rooms: {
    BookingCode: string;
    Inclusion: string;
    IsRefundable: boolean;
    MealType: string;
    Name: string[];
    RoomPreparation: string;
    TotalFare: number;
    TotalTax: number;
    WithTransfers: boolean;
  }[];
}

const Itinerary: React.FC<ItineraryProps> = () => {
  const { itineraryId } = useParams();
  const [data, setData] = useState<ItineraryData>(itineraryData);
  const [itineraryInfo, setItineraryInfo] = useState<ItineraryInfo | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [hotel, setHotel] = useState<IHotels | null>(null);
  const [fetchedHotels, setFetchedHotels] = useState<IHotels[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openHotelModal, setOpenHotelModal] = useState(false);
  const [newDestination, setNewDestination] = useState<Item>({
    name: "",
    significance: "Sample significance text", // Default significance
    type: "", // For the user to choose
    costPerDay: 0,
    city: "",
    state: "",
    airportWithin50kmRadius: true,
    banner: "",

  });
  const [placeType, setPlaceType] = useState<string | "Restaurant">(
    "destination"
  );

  const openAddModal = (dayIndex: number) => {
    setIsAddModalOpen(true);
    setDayIndex(dayIndex); // Default to the first day
  };
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setDayIndex(0); // Reset to the first day
  };

  const openRemoveModal = (item: Item) => {
    setCurrentItem(item);
    setIsRemoveModalOpen(true);
  };
  const closeRemoveModal = () => setIsRemoveModalOpen(false);

  useEffect(() => {
    socket.emit("joinRoom", itineraryId);
    socket.on("initialData", (initialData) => {
      console.log(initialData, "initialData");
      setItineraryInfo({
        _id: initialData.itineraryInfo._id,
        days: initialData.itineraryInfo.Days,
        budget: initialData.itineraryInfo.budget,
        location: initialData.itineraryInfo.location,
        permissions: initialData.itineraryInfo.permissions,
        title: initialData.itineraryInfo.title
      });
      setHotel(initialData.itineraryInfo.hotels[initialData.itineraryInfo.hotels.length - 1] || null);
      const itinerary = initialData.itineraryDestinations.map((day: Item[]) => {
        return sortItems(day).flat();
      });
      console.log(itinerary, "initialData");

      setData(itinerary);
    });

    socket.on("updatedData", (updatedData) => {
      setData(updatedData);
    });
    socket.on("hotelAdded", (hotel) => {
      console.log(hotel, "hotel");

      setHotel(hotel);
    });
    socket.on("hotelRemoved", () => {
      console.log("hotel removed");

      setHotel(null);
    });
    socket.on("savedData", (data) => {
      console.log(data, "savedData");
      
    })

    return () => {
      socket.off("initialData");
      socket.off("updatedData");
    };
  }, []);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceDayIndex = parseInt(source.droppableId);
    const destinationDayIndex = parseInt(destination.droppableId);

    let updatedData = [...data];

    if (sourceDayIndex === destinationDayIndex) {
      const dayItems = Array.from(data[sourceDayIndex]);
      const [movedItem] = dayItems.splice(source.index, 1);
      dayItems.splice(destination.index, 0, movedItem); // Move item within the same day
      updatedData[sourceDayIndex] = sortItems(dayItems).flat(); // Apply sorting logic
    } else {
      const sourceItems = Array.from(data[sourceDayIndex]);
      const destinationItems = Array.from(data[destinationDayIndex]);

      const [movedItem] = sourceItems.splice(source.index, 1);
      destinationItems.splice(destination.index, 0, movedItem);

      updatedData[sourceDayIndex] = sortItems(sourceItems).flat(); // Apply sorting logic
      updatedData[destinationDayIndex] = sortItems(destinationItems).flat(); // Apply sorting logic
    }

    setData(updatedData);
    socket.emit("updateData", updatedData);
  };

  const addNewDestination = (dayIndex: number) => {
    const day = data[dayIndex];

    const locationCount = day.filter((item) => item.type != "Restaurant").length;
    const restaurantCount = day.filter(
      (item) => item.type === "Restaurant"
    ).length;

    // If the day has space for a location or restaurant
    if (placeType != "Restaurant" && locationCount < MAX_LOCATIONS_PER_DAY) {
      const newItem: Item = {
        ...newDestination,
        id: Date.now(), // Assign a unique id for the new item
      };

      const updatedDay = [...day, newItem];
      const updatedData = [...data];
      updatedData[dayIndex] = updateItemIds(updatedDay); // Update ids

      // Sort the day items after addition
      updatedData[dayIndex] = updatedData[dayIndex].sort((a, b) => {
        if (a.id && !b.id) return -1;
        if (!a.id && b.id) return 1;
        return 0;
      });

      setData(updatedData);
      socket.emit("updateData", updatedData);
      closeAddModal(); // Close the modal after adding the destination
    } else if (
      placeType === "Restaurant" &&
      restaurantCount < MAX_RESTAURANTS_PER_DAY
    ) {
      const newItem: Item = {
        ...newDestination,
        significance: "", // Remove significance for restaurants
        type: "Restaurant",
      };

      const updatedDay = [...day, newItem];
      const updatedData = [...data];
      updatedData[dayIndex] = updateItemIds(updatedDay); // Update ids

      // Sort the day items after addition
      updatedData[dayIndex] = updatedData[dayIndex].sort((a, b) => {
        if (a.id && !b.id) return -1;
        if (!a.id && b.id) return 1;
        return 0;
      });

      setData(updatedData);
      socket.emit("updateData", updatedData);
      closeAddModal(); // Close the modal after adding the restaurant
    }
  };

  const removeDestination = () => {
    if (currentItem?.id) {
      const updatedData = data.map((day) => {
        return day.filter((item) => item.id !== currentItem?.id);
      });
      setData(updatedData);
      socket.emit("updateData", updatedData);
      toast.success(`${currentItem?.name} removed successfully!`);
    } else {
      const updatedData = data.map((day) => {
        return day.filter((item) => item.name !== currentItem?.name);
      });
      setData(updatedData);
      socket.emit("updateData", updatedData);
      toast.success(`${currentItem?.name} removed successfully!`);
    }
    closeRemoveModal();
  };

  const addHotel = (hotel: IHotels) => {

    setFetchedHotels(null);
    setHotel(hotel);
    socket.emit("addHotel", { data: hotel })
  }

  const removeHotel = () => {

    setFetchedHotels(null);
    setHotel(null);
    socket.emit("removeHotel", hotel)
  }

  const saveChanges = () => {
    console.log(data, "data", hotel);
    
    socket.emit("saveData", {
      itinerary: data, itineraryId, hotels: hotel, totalFare: hotel?.TotalFare || hotel?.Rooms[0].TotalFare || 0, totalTax: hotel?.TotalTax || hotel?.Rooms[0].TotalTax || 0
    });
    
    toast.success("Itinerary saved successfully!");
  };

  useEffect(() => {
    console.log(data, "data \n");
    console.log(currentItem, "currentItem");
    console.log(hotel, "hotel");
    
    console.log(fetchedHotels, "fetchedHotels");
    
  }, [data, currentItem, fetchedHotels, hotel]);


  return (
    <div className="min-h-screen relative bg-gradient-to-b from-sky-900 p-4 text-white pt-32">
      <h1 className="text-6xl font-semibold text-center mb-6">{itineraryInfo?.title} </h1>

      <div className="z-50  top-36 right-4 fixed">
        <button
          className=" text-white py-2 px-4 rounded bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800"
          disabled={data.length === 0}
          onClick={saveChanges}
        >
          Save Itinerary
        </button>
      </div>
      <div className="s" >
        {!hotel ? (
          <button className=" text-white py-2 px-4 rounded bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800" onClick={() => setOpenHotelModal(true)} >
            Add Hotel
          </button>

        ) : (
          <div className="flex justify-between gap-4">
            <div className="bg-white text-black p-4 rounded-lg" >
              <h2 className="text-xl font-semibold mb-2">Hotel</h2>
              <div className="" >
                <h4 className="text-lg font-semibold ">{hotel.HotelName}</h4>
                <p className="">{hotel.Address}</p>
                <p className="">{hotel.CityName}</p>
                <p className="">{hotel.CountryName}</p>
                <p className="">{hotel.HotelCode}</p>
                <p className="">{hotel.HotelRating}</p>
                {hotel.Rooms &&(
                  <div className="border border-gray-300 rounded-md p-2 mb-2 space-y-3">
                    <p className="">Room Total Fare: {hotel.Rooms[0].TotalFare} {hotel.Currency}</p>
                    <p className="">Room Total Tax: {hotel.Rooms[0].TotalTax} {hotel.Currency}</p>
                  </div>
                )}
                {!hotel.Rooms && (
                  <div  className="border border-gray-300 rounded-md p-2 mb-2 space-y-3">
                        <p className="">Room Total Fare: {hotel.TotalFare} {hotel.Currency || "USD"}</p>
                        <p className="">Room Total Tax: {hotel.TotalTax} {hotel.Currency || "USD"}</p>
                      </div>
                )

                }
                      
                  <Link to={`https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`} target="_blank" rel="noopener noreferrer" className="my-4 hover:underline">View Hotel</Link>
              </div>
              <button className=" text-white py-2 my-4 px-4 rounded bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800" onClick={removeHotel} >
                Remove Hotel
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {data.map((day, dayIndex) => {
            const updatedDayItems = updateItemIds(day); // Update item ids for each day
            return (
              <Droppable droppableId={`${dayIndex}`} key={`day-${dayIndex}`}>
                {(provided) => (
                  <div
                    className="shadow-md bg- rounded-lg p-4 mb-4"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className="text-xl font-semibold mb-2">
                      Day {dayIndex + 1}
                    </h2>

                    {/* Add Button */}
                    <button
                      className={`mb-4 bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800 text-white py-2 px-4 rounded ${day.length >=
                        MAX_LOCATIONS_PER_DAY + MAX_RESTAURANTS_PER_DAY
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                        }`}
                      onClick={() => openAddModal(dayIndex)}
                      disabled={
                        day.length >=
                        MAX_LOCATIONS_PER_DAY + MAX_RESTAURANTS_PER_DAY
                      }
                    >
                      Add New Destination
                    </button>

                    {updatedDayItems.map((item, index) => (
                      <Draggable
                        key={item.id || `${item.name}-${index}`}
                        draggableId={`${item.id || item.name}-${dayIndex}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="bg-gray-100 rounded-md p-2 mb-2 border border-gray-300 relative"
                            ref={provided.innerRef}
                            key={index}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ItineraryListItem
                              item={item}
                              index={index}
                              openRemoveModal={openRemoveModal}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </DragDropContext>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Add New Destination</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Place Type
              </label>
              <select
                value={placeType}
                onChange={(e) =>
                  setPlaceType(e.target.value as string | "Restaurant")
                }
                className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
              >
                <option value="">Select Place Type</option>
                {data[dayIndex].filter((item) => item.type != "Restaurant").length <
                  MAX_LOCATIONS_PER_DAY && (
                    <option value="destination">Destination</option>
                  )}
                {data[dayIndex].filter((item) => item.type === "Restaurant").length <
                  MAX_RESTAURANTS_PER_DAY && (
                    <option value="restaurant">Restaurant</option>
                  )}
              </select>
            </div>

            {/* Dynamic Fields */}
            {placeType === "destination" && (
              <>
                {placeType === "destination" && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newDestination.name}
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Significance
                      </label>
                      <input
                        type="text"
                        value={newDestination.significance}
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            significance: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Type (e.g., Temple, Fort, etc.)
                      </label>
                      <input
                        type="text"
                        value={newDestination.type}
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            type: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Airport Within 50km Radius
                      </label>
                      <select
                        value={
                          newDestination.airportWithin50kmRadius ? "yes" : "no"
                        }
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            airportWithin50kmRadius: e.target.value === "yes",
                          })
                        }
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        value={newDestination.city || ""}
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            city: e.target.value,
                          })
                        }
                        placeholder="Enter city"
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        value={newDestination.state || ""}
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            state: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                        placeholder="Enter state"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {placeType === "restaurant" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newDestination.name}
                    onChange={(e) =>
                      setNewDestination({
                        ...newDestination,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                    placeholder="Enter name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={newDestination.city}
                    onChange={(e) =>
                      setNewDestination({
                        ...newDestination,
                        city: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                    placeholder="Enter city"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Distance
                  </label>
                  <input
                    type="number"
                    value={newDestination.distance || 0}
                    onChange={(e) =>
                      setNewDestination({
                        ...newDestination,
                        distance: +e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                  />
                </div>
              </>
            )}

            <div className="flex justify-between">
              <button
                className={`bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800 text-white py-2 px-4 rounded ${newDestination.name === ""
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
                onClick={() => addNewDestination(dayIndex)}
              >
                Add
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={closeAddModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Item Modal */}
      {isRemoveModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Are you sure you want to remove {currentItem?.name}?
            </h3>
            <div className="flex justify-between gap-4">
              <button
                className="bg-red-500 text-white py-2 px-4 rounded"
                onClick={removeDestination}
              >
                Remove
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={closeRemoveModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Hoyel Modal */}
      {openHotelModal && (
        <HotelBookingForm openHotelModal={openHotelModal} closeModal={() => setOpenHotelModal(false)} setFetchedHotels={setFetchedHotels} setIsLoading={setIsLoading} />
      )}
      {fetchedHotels && (
        <div className="fixed min-w-screen inset-0  min-h-screen flex justify-center overflow-y-auto top-0 pt-10 bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 w-1/2 rounded-lg h-fit">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Hotels
            </h3>
            <div className="flex flex-col gap-2 h-full">
              {fetchedHotels.map((hotel) => (
                <div
                  key={hotel.HotelCode}
                  className="bg-gray-100 rounded-md p-2 mb-2 border border-gray-300 relative"
                >
                  <h4 className="text-lg font-semibold text-gray-800">{hotel.HotelName}</h4>
                  <p className="text-gray-600">{hotel.Address}</p>
                  <p className="text-gray-600">{hotel.CityName}</p>
                  <p className="text-gray-600">{hotel.CountryName}</p>
                  <p className="text-gray-600">{hotel.HotelCode}</p>
                  <p className="text-gray-600">{hotel.HotelRating}</p>
                  <div className="mt-2" >
                    {hotel.Rooms.map((room) => (
                      <div key={room.BookingCode} className="border border-gray-300 rounded-md p-2 mb-2 space-y-3">
                        <p className="text-gray-600">Room Name: {room.Name[0]}</p>
                        <p className="text-gray-600">Room Meal Type: {room.MealType}</p>
                        <p className="text-gray-600">Room Total Fare: {room.TotalFare} {hotel.Currency || "USD"}</p>
                        <p className="text-gray-600">Room Total Tax: {room.TotalTax} {hotel.Currency || "USD"}</p>
                      </div>
                    ))}
                  </div>
                  <button className="bg-cyan-600 transition duration-300 ease-in-out hover:bg-sky-800 text-white py-2 px-4 rounded" onClick={() => addHotel(hotel)} > Book</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0  flex justify-center flex-col items-center bg-black bg-opacity-70 text-white z-50">
          <Circles
                    height="80"
                    width="80"
                    color="#fff"
                    ariaLabel="circles-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                  />
                  We are fetching hotels for you.
        </div>
      )}

    </div>
  );
};

export default Itinerary;
