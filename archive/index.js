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

importData();
