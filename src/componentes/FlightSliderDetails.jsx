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
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false
  };

  return (
    <div className="px-1">
      <div className="slider-container" style={{ width: "100%", margin: "0 auto" }}>
        <Slider {...settings}>
          {flights.map((flight) => (
            <div key={flight.id} className="pb-3 px-1">
              <FlightsDetailCard flight={flight} onBook={onBook} compact={true} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default FlightSliderDetails;