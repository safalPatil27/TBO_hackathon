import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import Gallery from "./pages/Gallery";
import Weather from "./pages/Weather";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import ItineraryForm from "./pages/ItineraryForm";
import Login from "./pages/Login";
import Itinerary from "./components/Itinerary";
import Dashboard from "./pages/Dashboard";
import AuthenticatedWrapper from "./components/AuthenticatedWrapper";
import { ToastContainer } from "react-toastify";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ToastContainer />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/itinerary"
              element={
                <AuthenticatedWrapper redirectTo="/login">
                  <ItineraryForm />
                </AuthenticatedWrapper>
              }
            />
            <Route
              path="/itinerary/:itineraryId"
              element={<Itinerary title="Jaipur" />}
            />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <AuthenticatedWrapper>
                  <Dashboard />
                </AuthenticatedWrapper>
              }
            />
            <Route path="/hotels" element={<Hotels />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
