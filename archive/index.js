const mongoose = require('mongoose');
const xlsx = require('xlsx');
const TouristPlace = require('./tourist_place'); // Import the model

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/TBO_Hackathon', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Read Excel file
const workbook = xlsx.readFile('Top Indian Places to Visit.csv'); // Replace with your file name
const sheetName = workbook.SheetNames[0];
const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Map Excel data to schema
const importData = async () => {
  try {
    const formattedData = sheetData.map((row) => ({
      id: row.id,
      zone: row.Zone,
      state: row.State,
      city: row.City,
      name: row.Name,
      type: row.Type,
      establishmentYear: row.Establishment_Year,
      timeNeededToVisitInHours: row['time needed to visit in hrs'],
      googleReviewRating: row['Google review rating'],
      entranceFeeInINR: row['Entrance Fee in INR'],
      airportWithin50kmRadius: row['Airport with 50km Radius'] === 'Yes', // Convert Yes/No to Boolean
      weeklyOff: row['Weekly Off'],
      significance: row.Significance,
      dslrAllowed: row['DSLR Allowed'] === 'Yes', // Convert Yes/No to Boolean
      numberOfGoogleReviewsInLakhs: row['Number of google review in lakhs'],
      bestTimeToVisit: row['Best Time to visit'],
    }));

    // Insert into the database
    await TouristPlace.insertMany(formattedData);
    console.log('Data successfully imported');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error importing data:', err);
  }
};

const updateTypeField = async () => {
  try {
    // Iterate through categoryMapping
    for (const [newType, existingTypes] of Object.entries(categoryMapping)) {
      // Update all documents where the type matches any existing type in the category
      const result = await TouristPlace.updateMany(
        { type: { $in: existingTypes } },
        { $set: { type: newType } }
      );
      console.log(
        `Updated ${result.modifiedCount} documents to type: ${newType}`
      );
    }
    console.log("Type field update completed!");
  } catch (error) {
    console.error("Error updating type field:", error);
  } finally {
    mongoose.connection.close(); // Close the connection after the updates
  }
};

const categoryMapping = {
  Temples: [
    "Church", "Gurudwara", "Mosque", "Religious Complex", "Religious Shrine", 
    "Religious Site", "Shrine", "Temple", "Temples", "Spiritual Center", "Gurudwara", "Shrine", "Spiritual Center", "Church", "Mosque", "Temple", "Religious Complex", "Religious Shrine", "Religious Site"
  ],
  Lakes: [
    "Lake",
  ],
  Beaches: [
    "Beach", "Promenade", "Scenic Area", "River Island"
  ],
  NationalParks: [
    "National Park", "Bird Sanctuary", "Wildlife Sanctuary", "Botanical Garden", "Zoo","Park", "Botanical Garden"
  ],
  Forts: [
    "Fort", "Palace", "Historical", "Monument", "War Memorial", "Prehistoric Site", "Fort", "Palace", "Memorial", "Monument", "Mausoleum", "Tomb", "Tombs"
  ],
  AdventureSports: [
    "Adventure Sport", "Ski Resort", "Trekking"
  ],
  Amusement: [
    "Amusement Park", "Theme Park", "Film Studio", "Entertainment","Race Track"
  ],
  Nature: [
    "Aquarium", "Dam", "Cave", "Hill", "Mountain Peak", "Valley", "Waterfall", "Zoo", "Orchard", "Tea Plantation"
  ],
  Cultural: [
    "Cultural", "Cricket Ground", "Government Building", "Museum", "Observatory", "Rock Carvings", "Sculpture Garden", "Science", "Landmark", "Site", "Tomb", "Tombs", "Monastery", "Mausoleum", "Monument", "War Memorial"
  ],
  UrbanDevelopment: [
    "Commercial Complex", "Mall", "Market", "Township", "Urban Development Project", "Suspension Bridge", "Border Crossing"
  ],
  Scenic: [
    "Bridge", "Confluence", "Ghat", "Gravity Hill", "Island", "Landmark", "Promenade", "Scenic Point", "Sunrise Point", "Viewpoint", "Stepwell"
  ],
 
};

updateTypeField();

