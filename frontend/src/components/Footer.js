import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <section className="footer">
      <div className="box-container">
        <div className="box">
          <h3>contact info</h3>
          <a href="tel:+201234567912">
            <i className="fas fa-phone"></i> Supervisor: +20 123-456-789-12
          </a>
          <a href="tel:+201234567731">
            <i className="fas fa-phone"></i> Admin: +20 123-456-773-31
          </a>
          <a href="mailto:marketing@savoy-sharm.com">
            <i className="fas fa-envelope"></i> Ahmed samir:<br /> marketing@savoy-sharm.com
          </a>
          <a href="mailto:savoyreservation@savoy-sharm.com">
            <i className="fas fa-envelope"></i> Sarah amir:<br /> savoyreservation@savoy-sharm.com
          </a>
        </div>

        <div className="box">
          <h3>quick links</h3>
          <Link to="/">
            <i className="fas fa-arrow-right"></i> home
          </Link>
          <Link to="/about">
            <i className="fas fa-arrow-right"></i> about
          </Link>
          <Link to="/rooms">
            <i className="fas fa-arrow-right"></i> rooms
          </Link>
          <Link to="/gallery">
            <i className="fas fa-arrow-right"></i> gallery
          </Link>
          <Link to="/reservation">
            <i className="fas fa-arrow-right"></i> reservation
          </Link>
        </div>

        <div className="box">
          <h3>extra links</h3>
          <Link to="/policies/refund">
            <i className="fas fa-arrow-right"></i> refund policy
          </Link>
          <Link to="/policies/privacy">
            <i className="fas fa-arrow-right"></i> privacy policy
          </Link>
          <Link to="/policies/terms">
            <i className="fas fa-arrow-right"></i> terms of service
          </Link>
          <Link to="/policies/cancellation">
            <i className="fas fa-arrow-right"></i> cancellation policy
          </Link>
          <Link to="/contact">
            <i className="fas fa-arrow-right"></i> contact us
          </Link>
        </div>
      </div>

      <div className="share">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="fab fa-facebook-f" aria-label="Facebook"></a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="fab fa-instagram" aria-label="Instagram"></a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="fab fa-twitter" aria-label="Twitter"></a>
        <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="fab fa-pinterest" aria-label="Pinterest"></a>
      </div>
      
      <div className="credit">
        <p>&copy; {new Date().getFullYear()} <span>Savoy Hotel</span>. All Rights Reserved.</p>
      </div>
    </section>
  );
};

export default Footer;
