import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Gallery.css";

const Gallery = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const galleryImages = [
    {
      id: 1,
      src: `${process.env.PUBLIC_URL}/assets/images/hotel-image.jpg`,
      alt: "Hotel Exterior",
      category: "hotel",
    },
    {
      id: 2,
      src: `${process.env.PUBLIC_URL}/assets/images/exclusive.jpg`,
      alt: "Luxury Suite",
      category: "rooms",
    },
    {
      id: 3,
      src: `${process.env.PUBLIC_URL}/assets/images/pool.jpg`,
      alt: "Swimming Pool",
      category: "amenities",
    },
    {
      id: 4,
      src: `${process.env.PUBLIC_URL}/assets/images/beach.jpg`,
      alt: "Beach View",
      category: "views",
    },
    {
      id: 5,
      src: `${process.env.PUBLIC_URL}/assets/images/resturant.jpg`,
      alt: "Restaurant",
      category: "dining",
    },
    {
      id: 6,
      src: `${process.env.PUBLIC_URL}/assets/images/spa.jpg`,
      alt: "Spa Treatment",
      category: "spa",
    },
    {
      id: 7,
      src: `${process.env.PUBLIC_URL}/assets/images/presidential.jpg`,
      alt: "Presidential Suite",
      category: "rooms",
    },
    {
      id: 8,
      src: `${process.env.PUBLIC_URL}/assets/images/conference.jpg`,
      alt: "Conference Room",
      category: "facilities",
    },
    {
      id: 9,
      src: `${process.env.PUBLIC_URL}/assets/images/food.jpg`,
      alt: "Gourmet Food",
      category: "dining",
    },
    {
      id: 10,
      src: `${process.env.PUBLIC_URL}/assets/images/ocean.jpg`,
      alt: "Ocean View",
      category: "views",
    },
    {
      id: 11,
      src: `${process.env.PUBLIC_URL}/assets/images/lobby.jpg`,
      alt: "Lobby",
      category: "hotel",
    },
    {
      id: 12,
      src: `${process.env.PUBLIC_URL}/assets/images/fitness.jpg`,
      alt: "Fitness Center",
      category: "amenities",
    },
  ];

  const categories = [
    { id: "all", name: "All" },
    { id: "hotel", name: "Hotel" },
    { id: "rooms", name: "Rooms" },
    { id: "views", name: "Views" },
    { id: "dining", name: "Dining" },
    { id: "amenities", name: "Amenities" },
    { id: "facilities", name: "Facilities" },
    { id: "spa", name: "Spa" },
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredImages =
    activeCategory === "all"
      ? galleryImages
      : galleryImages.filter((image) => image.category === activeCategory);

  const openLightbox = (image) => {
    setCurrentImage(image);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling when lightbox is open
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
    document.body.style.overflow = "auto"; // Restore scrolling
  };

  const nextImage = () => {
    const currentIndex = filteredImages.findIndex(
      (img) => img.id === currentImage.id
    );
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setCurrentImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = filteredImages.findIndex(
      (img) => img.id === currentImage.id
    );
    const prevIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentImage(filteredImages[prevIndex]);
  };

  return (
    <section className="gallery-section">
      <h1 className="heading">Our Gallery</h1>

      <div className="gallery-filter">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`filter-btn ${
              activeCategory === category.id ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="gallery-item"
            onClick={() => openLightbox(image)}
          >
            <img src={image.src} alt={image.alt} />
            <div className="gallery-overlay">
              <div className="overlay-content">
                <h3>{image.alt}</h3>
                <p>Click to enlarge</p>
                <div className="icon">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="gallery-slider-container">
        <h2>Featured Gallery</h2>
        <Swiper
          spaceBetween={10}
          grabCursor={false}
          loop={true}
          centeredSlides={false}
          pagination={{
            el: ".swiper-pagination",
            clickable: true,
          }}
          navigation={true}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 3,
            },
            991: {
              slidesPerView: 4,
            },
          }}
          modules={[Pagination, Navigation]}
          className="gallery-slider"
        >
          {galleryImages.map((image) => (
            <SwiperSlide key={image.id} className="slide">
              <div
                className="gallery-slide-item"
                onClick={() => openLightbox(image)}
              >
                <img src={image.src} alt={image.alt} />
                <div className="icon">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination"></div>
        </Swiper>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox">
          <div className="lightbox-content">
            <button className="close-btn" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </button>
            <button className="nav-btn prev-btn" onClick={prevImage}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="lightbox-image-container">
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                className="lightbox-image"
              />
              <p className="image-caption">{currentImage.alt}</p>
            </div>
            <button className="nav-btn next-btn" onClick={nextImage}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
