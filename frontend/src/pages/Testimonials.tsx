import testimonial1 from '../assets/images/testimonial1.jpg';
import testimonial2 from '../assets/images/testimonial2.jpg';
import testimonial3 from '../assets/images/testimonial3.jpg';

const Testimonial = () => {
  return (
    <div className="p-10 bg-gradient-to-b ">
      <h1 className="text-4xl font-semibold text-center font-Playfair tracking-wider mb-6 text-gray-800">
        What Our Clients Say
      </h1>

      <div className="text-center mb-10">
        <span className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold shadow-md">
          Client Feedback
        </span>
        <p className="text-lg md:text-xl mt-3 text-gray-600 font-medium">
          Hear from our happy travelers!
        </p>
      </div>

      {/* Testimonial Cards */}
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
        
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
          <img
            className="w-full h-64 object-cover"
            src={testimonial1}
            alt="Client John Doe"
          />
          <div className="p-6 text-center">
            <h5 className="mb-2 text-xl md:text-2xl font-bold text-gray-800">
              John Doe
            </h5>
            <p className="text-gray-600 font-medium italic">
              "Perfect itinerary! Easy and hassle-free."
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
          <img
            className="w-full h-64 object-cover"
            src={testimonial2}
            alt="Client Franklin Dash"
          />
          <div className="p-6 text-center">
            <h5 className="mb-2 text-xl md:text-2xl font-bold text-gray-800">
              Franklin Dash
            </h5>
            <p className="text-gray-600 font-medium italic">
              "Saved me time! Great recommendations."
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
          <img
            className="w-full h-64 object-cover"
            src={testimonial3}
            alt="Client Michal Smith"
          />
          <div className="p-6 text-center">
            <h5 className="mb-2 text-xl md:text-2xl font-bold text-gray-800">
              Michal Smith
            </h5>
            <p className="text-gray-600 font-medium italic">
              "Loved the plan! Smooth and stress-free."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
