const mongoose = require('mongoose');

// Define the schema for tourist places
const touristPlaceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Unique identifier
  zone: { type: String, required: true }, // Zone of the place
  state: { type: String, required: true }, // State
  city: { type: String, required: true }, // City
  name: { type: String, required: true }, // Name of the place
  type: { type: String, required: true }, // Type (e.g., Historical, Natural)
  establishmentYear: { type: String }, // Year of establishment
  timeNeededToVisitInHours: { type: Number }, // Time required in hours
  googleReviewRating: { type: Number, min: 0, max: 5 }, // Google review rating
  entranceFeeInINR: { type: Number }, // Entrance fee in INR
  airportWithin50kmRadius: { type: Boolean }, // Whether there's an airport within 50km
  weeklyOff: { type: String }, // Weekly off day (if any)
  significance: { type: String }, // Cultural/historical significance
  dslrAllowed: { type: Boolean }, // DSLR allowed or not
  numberOfGoogleReviewsInLakhs: { type: Number }, // Number of reviews in lakhs
  bestTimeToVisit: { type: String } // Best time to visit
});

// Create the model
const TouristPlace = mongoose.model('TouristPlace', touristPlaceSchema);

// Export the model
module.exports = TouristPlace;
