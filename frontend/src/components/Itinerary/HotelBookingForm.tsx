import { useState } from "react";
import { countryList } from "../../constants/data";
import { useMutation } from "@tanstack/react-query";
import { displayHotels } from "../../utils/nodeMutations";
import { useAuth } from "../../contexts/AuthUserContexts";

interface IHotel {
    countrycode: string;
    location: string;
    adults: number;
    children: number;
    star_rating: string;
    start_date: string;
    end_date: string;
    No_of_rooms: number;
}
const starRatings = ["OneStar", "TwoStar", "ThreeStar", "FourStar", "FiveStar"];
interface IHotels {
    Address: string;
    CityName: string;
    CountryCode: string;
    CountryName: string;
    Currency: string;
    HotelCode: string;
    HotelName: string;
    HotelRating: string;
    Latitude: string;
    Longitude: string;
    rooms: {
        bookingCode: string;
        inclusion: string;
        isRefundable: boolean;
        mealType: string;
        name: string[];
        roomPreparation: string;
        totalFare: number;
        totalTax: number;
        withTransfers: boolean;
    }[];
}
const HotelBookingForm = ({ openHotelModal, closeModal, setFetchedHotels }: { openHotelModal: boolean; closeModal: () => void; addHotel?: (hotel: IHotel) => void; setFetchedHotels: (hotels: IHotels[]) => void }) => {
    const [hotel, setHotel] = useState<IHotel>({
        countrycode: "",
        location: "",
        adults: 0,
        children: 0,
        star_rating: "OneStar",
        start_date: "",
        end_date: "",
        No_of_rooms: 1,
    });
    const { state } = useAuth();

    const displayHotelsMutation = useMutation({
        mutationFn: displayHotels,
        onSuccess: (data) => {
            console.log("Hotel added successfully!", data);
            setFetchedHotels(data.data.data);
        },
        onError: (error: any) => {
            const errorMessage = error?.message || "Something went wrong!";
            console.log(errorMessage);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log(name, value);
        if (name === "star_rating") {
            setHotel((prev) => ({
                ...prev,
                [name]: starRatings[Number(value) - 1],
            }));
            return
        } else {
            setHotel((prev) => ({
                ...prev,
                [name]: name === "adults" || name === "children" || name === "star_rating" || name === "No_of_rooms" ? Number(value) : value,
            }));
        }

    };

    const handleSubmit = () => {
        if (!hotel.countrycode || !hotel.location || !hotel.start_date || !hotel.end_date) return;

        displayHotelsMutation.mutate({
            data: hotel,
            bearer: state.user?.accessToken || "",
        })
        console.log(hotel);
        closeModal();
    };

    return (
        openHotelModal && (
            <div className="fixed inset-0 flex items-center justify-center min-h-screen min-w-screen overflow-y-auto  bg-gray-500 pt-32 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg w-1/3">
                    <h2 className="text-xl font-semibold mb-4">Add New Hotel</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <select
                            value={hotel.countrycode}
                            onChange={(e) => setHotel({ ...hotel, countrycode: e.target.value })}
                            className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded mt-1"
                        >
                            <option value="">Select Country</option>
                            {countryList.map((country) => (
                                <option key={`${country.Code}-${country.Name}`} value={country.Code}>
                                    {country.Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4 text-gray-700">
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={hotel.location}
                            onChange={handleChange}
                            className="w-full p-2 border rounded mt-1"
                            placeholder="Enter location"
                        />
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2 text-gray-700">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Adults</label>
                            <input
                                type="number"
                                name="adults"
                                value={hotel.adults || 0}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                        <div className="text-gray-700" >
                            <label className="block text-sm font-medium text-gray-700">Children</label>
                            <input
                                type="number"
                                name="children"
                                value={hotel.children}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                    </div>

                    <div className="mb-4 text-gray-700">
                        <label className="block text-sm font-medium text-gray-700">Star Rating</label>
                        <input
                            type="number"
                            name="star_rating"
                            value={starRatings.indexOf(hotel.star_rating) + 1}
                            onChange={handleChange}
                            min={1}
                            max={5}
                            className="w-full p-2 border rounded mt-1"
                        />
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2">
                        <div className="text-gray-700" >
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={hotel.start_date}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                        <div className="text-gray-700" >
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={hotel.end_date}
                                min={hotel.start_date}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </div>
                    </div>

                    <div className="mb-4 text-gray-700">
                        <label className="block text-sm font-medium text-gray-700">Number of Rooms</label>
                        <input
                            type="number"
                            name="No_of_rooms"
                            value={hotel.No_of_rooms}
                            onChange={handleChange}
                            min={1}
                            className="w-full p-2 border rounded mt-1"
                        />
                    </div>

                    <div className="flex justify-between">
                        <button
                            className="bg-cyan-600 hover:bg-sky-800 text-white py-2 px-4 rounded"
                            onClick={handleSubmit}
                            disabled={!hotel.countrycode || !hotel.location || !hotel.start_date || !hotel.end_date}
                        >
                            Add Hotel
                        </button>
                        <button
                            className="bg-gray-500 text-white py-2 px-4 rounded"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default HotelBookingForm;
