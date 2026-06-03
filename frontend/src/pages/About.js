import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="hero-content">
          <h1>About Savoy Hotel</h1>
          <p>Luxury accommodation in the heart of Sharm El Sheikh</p>
        </div>
      </div>

      <div className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-image">
              <img src={`${process.env.PUBLIC_URL}/assets/images/about.jpg`} alt="Savoy Hotel" />
            </div>

            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                Welcome to Savoy Hotel, an oasis of luxury on the pristine
                shores of Sharm El Sheikh. Nestled in the heart of the iconic
                Soho Square, our five-star resort offers a seamless blend of
                Arabian hospitality and modern elegance. With breathtaking views
                of the Red Sea, Savoy Hotel invites you to experience
                unparalleled comfort and relaxation.
              </p>
              <p>
                With its lush gardens, private beach, and world-class amenities,
                Savoy is your gateway to a blissful escape. Our hotel has been
                serving guests since 1999, consistently delivering exceptional
                service and unforgettable experiences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mission-vision">
        <div className="container">
          <h2 className="section-title">Our Mission & Vision</h2>
          <div className="mission-vision-content">
            <div className="mission">
              <h3>Mission</h3>
              <p>
                The mission of the Savoy Hotel is to put hospitality services on
                the highest level in order to satisfy the demands and
                expectations of guests. Our aim is to make the Savoy hotel a
                place for encounters, business success, pleasant meetings and
                gala ceremonies.
              </p>
            </div>

            <div className="vision">
              <h3>Vision</h3>
              <p>
                The ideology of our vision is to continue to apply and set the
                highest standards of service quality and in that way justify and
                uphold the reputation that we have among the guests, partners,
                competitors and the wider community.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-utensils"></i>
              </div>
              <h3>Fine Dining</h3>
              <p>
                Experience culinary excellence with our diverse restaurants
                offering local and international cuisine.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-spa"></i>
              </div>
              <h3>Luxury Spa</h3>
              <p>
                Rejuvenate your mind, body, and spirit with our premium spa
                treatments and facilities.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-swimming-pool"></i>
              </div>
              <h3>Swimming Pools</h3>
              <p>
                Relax and unwind at our pristine swimming pools with stunning
                ocean views.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-concierge-bell"></i>
              </div>
              <h3>24/7 Concierge</h3>
              <p>
                Our dedicated concierge team is available round the clock to
                cater to your every need.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-glass-cheers"></i>
              </div>
              <h3>Events & Celebrations</h3>
              <p>
                Host unforgettable events with our specialized venues and
                professional planning services.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-water"></i>
              </div>
              <h3>Private Beach</h3>
              <p>
                Enjoy exclusive access to our private beach with pristine sands
                and crystal-clear waters.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="team-section">
        <div className="container">
          <h2 className="section-title">Our Leadership Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/review-1.png`}
                  alt="Team Member"
                />
              </div>
              <h3>Ahmed Samir</h3>
              <p className="position">Marketing Director</p>
              <p>
                Leads our marketing strategies with over 15 years of hospitality
                experience.
              </p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img
                  src={`${process.env.PUBLIC_URL}/assets/images/review-2.png`}
                  alt="Team Member"
                />
              </div>
              <h3>Sarah Amir</h3>
              <p className="position">Reservations Manager</p>
              <p>
                Ensures smooth booking operations and exceptional guest
                experiences since 2010.
              </p>
            </div>

            <div className="team-member">
              <div className="member-image">
                <img src={`${process.env.PUBLIC_URL}/assets/images/review-3.png`} alt="Team Member" />
              </div>
              <h3>Mohamed Hassan</h3>
              <p className="position">Executive Chef</p>
              <p>
                Creates culinary masterpieces with international training and
                local expertise.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Experience Luxury Like Never Before</h2>
            <p>Ready to indulge in the ultimate vacation experience?</p>
            <Link to="/reservation" className="btn">
              Book Your Stay Now
            </Link>
          </div>
        </div>
      </div>

      <div className="address-section">
        <div className="container">
          <h2 className="section-title">Our Location</h2>
          <div className="address-content">
            <div className="address-info">
              <h3>Address</h3>
              <p>
                46911 Sharm el-Sheikh
                <br />
                South Sinai
                <br />
                Egypt
              </p>
              <p>P.O Box 169, Soho Square, Sharm el-Sheikh 0, Egypt</p>

              <h3>Contact</h3>
              <p>
                <i className="fas fa-phone"></i> Supervisor: +20 123-456-789-12
              </p>
              <p>
                <i className="fas fa-phone"></i> Admin: +20 123-456-773-31
              </p>
              <p>
                <i className="fas fa-envelope"></i> marketing@savoy-sharm.com
              </p>
              <p>
                <i className="fas fa-envelope"></i>{" "}
                savoyreservation@savoy-sharm.com
              </p>
            </div>

            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3435.770699353428!2d34.29678041508723!3d27.863612932726297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7f15a6c97725%3A0x808a05f013ec49b4!2sSOHO%20Square%2C%20El-Shaikh%20Zayed%20St%2C%20Sharm%20El%20Sheikh%2C%20South%20Sinai%20Governorate%2C%20Egypt!5e0!3m2!1sen!2s!4v1622766509291!5m2!1sen!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Hotel Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
