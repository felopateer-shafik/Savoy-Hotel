import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./Home.css";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const slides = [
    {
      id: 1,
      image: `${process.env.PUBLIC_URL}/assets/images/home-slide1.jpg`,
      title: "It's where dreams come true",
    },
    {
      id: 2,
      image: `${process.env.PUBLIC_URL}/assets/images/home-slide2.jpg`,
      title: "It's where dreams come true",
    },
    {
      id: 3,
      image: `${process.env.PUBLIC_URL}/assets/images/home-slide3.jpg`,
      title: "It's where dreams come true",
    },
    {
      id: 4,
      image: `${process.env.PUBLIC_URL}/assets/images/home-slide4.jpg`,
      title: "It's where dreams come true",
    },
  ];

  useEffect(() => {
    // Ensure component is fully mounted before rendering Swiper
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div
        className="loading-container"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <section className="home" id="home">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          grabCursor={false}
          loop={true}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          className="home-slider"
          onSwiper={(swiper) => {
            // Ensure swiper is properly initialized
            setTimeout(() => {
              swiper.update();
            }, 100);
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide
              key={slide.id}
              className="slide"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="content">
                <h3>{slide.title}</h3>
                <Link to="/rooms" className="btn">
                  visit our offers
                </Link>
              </div>
            </SwiperSlide>
          ))}

          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
        </Swiper>
      </section>

      <div className="vission">
        <h3 className="aboutUs">Vision and Mission</h3>
        <div className="vissionMission">
          <p>
            Mission: The mission of the Savoy Hotel is to put hospitality
            services on the highest level in order to satisfy the demands and
            expectations of guests. Our aim is to make the Savoy hotel a place
            for encounters, business success, pleasant meetings and gala
            ceremonies.
          </p>
          <p>
            Vision: The ideology of our vision is to continue to apply and set
            the highest standards of service quality and in that way justify and
            uphold the reputation that we have among the guests, partners,
            competitors and the wider community.
          </p>
        </div>
      </div>

      <section className="about" id="about-preview">
        <div className="row">
          <div className="image">
            <img
              src={`${process.env.PUBLIC_URL}/assets/images/about.jpg`}
              alt="Savoy Hotel"
            />
          </div>

          <div className="content">
            <h3>About Us</h3>
            <p>
              Welcome to Savoy Hotel, an oasis of luxury on the pristine shores
              of Sharm El Sheikh. Nestled in the heart of the iconic Soho
              Square, our five-star resort offers a seamless blend of Arabian
              hospitality and modern elegance. With breathtaking views of the
              Red Sea, Savoy Hotel invites you to experience unparalleled
              comfort and relaxation. With its lush gardens, private beach, and
              world-class amenities, Savoy is your gateway to a blissful escape.
            </p>
            <p>
              <b>LUXURY ESCAPES</b> <br />
              Make the most of all that The Savoy have to offer with our
              selection of unique experiences. From cultural and culinary to
              relaxing stays, The Savoy's exclusive 5-star offers are not to be
              missed.
            </p>
            <Link to="/about" className="btn">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-rooms">
        <h1 className="heading">Featured Rooms</h1>
        <div className="room-preview">
          <div className="room-card">
            <div className="image">
              <span className="price">$380/night</span>
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/exclusive.jpg`}
                alt="Luxury Room"
              />
            </div>
            <div className="content">
              <h3>Exclusive Suite</h3>
              <p>
                Our Exclusive Suites offer a sophisticated retreat with a
                separate living area, a spacious bedroom, and a luxurious
                bathroom featuring a freestanding tub and a walk-in shower.
              </p>
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <Link to="/rooms" className="btn">
                View Details
              </Link>
            </div>
          </div>

          <div className="room-card">
            <div className="image">
              <span className="price">$200/night</span>
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/panoramic.jpg`}
                alt="Ocean View Room"
              />
            </div>
            <div className="content">
              <h3>Panoramic View Room</h3>
              <p>
                Wake up to breathtaking views in our Panoramic View Rooms. These
                well-appointed rooms feature floor-to-ceiling windows showcasing
                the stunning city skyline.
              </p>
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
              <Link to="/rooms" className="btn">
                View Details
              </Link>
            </div>
          </div>
        </div>
        <div className="view-all">
          <Link to="/rooms" className="btn">
            View All Rooms
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
