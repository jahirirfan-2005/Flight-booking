import SliderComponent from "react-slick";

const Slider = SliderComponent.default || SliderComponent;
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import FlightsDetailCard from "./FlightsDetailCard";
const FlightSliderDetails = ({ flights, onBook }) => {
  if (!flights || flights.length === 0) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    autoplay: true,
    autoplaySpeed: 4000,
    beforeChange: (currentSlide, nextSlide) => {
      console.log("Before Change:", currentSlide, nextSlide);
    },
    afterChange: (currentSlide) => {
      console.log("After Change:", currentSlide);
    },
  };

  return (
    <div className="px-1">
      <div className="slider-container" style={{ minHeight: "260px", width: "100%", maxWidth: "360px", margin: "0 auto" }}>
        <Slider {...settings}>
          {flights.map((flight) => (
            <div key={flight.id} className="py-2">
              <FlightsDetailCard flight={flight} onBook={onBook} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default FlightSliderDetails;