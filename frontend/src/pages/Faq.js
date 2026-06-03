import React, { useState } from 'react';
import './Faq.css';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What are the check-in and check-out times?",
      answer: "Our standard check-in time is 3:00 PM and check-out time is 12:00 PM. Early check-in and late check-out can be arranged based on availability for an additional fee."
    },
    {
      question: "Is breakfast included in the room rate?",
      answer: "Yes, breakfast is included in most of our room rates. We offer a sumptuous buffet breakfast with a variety of international dishes, fresh fruits, and beverages. Please check your specific booking for details."
    },
    {
      question: "Do you provide airport transfers?",
      answer: "Yes, we offer airport transfers for our guests. You can request this service during booking or by contacting our concierge team. Additional charges apply based on the type of vehicle and time of transfer."
    },
    {
      question: "Is there free Wi-Fi at the hotel?",
      answer: "Yes, complimentary high-speed Wi-Fi is available throughout the hotel premises, including all guest rooms, lobbies, and restaurants."
    },
    {
      question: "Are pets allowed at the hotel?",
      answer: "We have a limited number of pet-friendly rooms available. Please inform us in advance if you plan to bring a pet. Additional cleaning fees and restrictions may apply."
    },
    {
      question: "What amenities are available at the hotel?",
      answer: "Our hotel features multiple restaurants, bars, swimming pools, a spa and wellness center, fitness facility, private beach access, business center, and concierge services. All rooms are equipped with air conditioning, flat-screen TVs, minibars, and luxury bath amenities."
    },
    {
      question: "Do you have facilities for guests with disabilities?",
      answer: "Yes, we have specially designed rooms and facilities for guests with disabilities. These include wheelchair-accessible rooms, elevators, and public areas. Please specify your requirements when booking."
    },
    {
      question: "Is there parking available at the hotel?",
      answer: "Yes, we offer both valet and self-parking options. Valet parking is available for a fee, while self-parking is complimentary for hotel guests."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Our standard cancellation policy allows free cancellation up to 48 hours before check-in. Cancellations made within 48 hours of check-in may incur a fee equivalent to one night's stay. Special rates and promotions may have different cancellation terms."
    },
    {
      question: "Do you offer room service?",
      answer: "Yes, we offer 24-hour room service with a variety of dining options. A room service menu is available in your room, or you can call our in-room dining team for assistance."
    },
    {
      question: "Are children allowed to stay at the hotel?",
      answer: "Yes, children of all ages are welcome at our hotel. We offer family rooms, children's activities, and babysitting services (upon request). Children under 12 years stay free when sharing a room with parents."
    },
    {
      question: "Can I host events or meetings at the hotel?",
      answer: "Yes, we have several event spaces and meeting rooms available for various occasions, from corporate meetings to weddings. Our events team can help you plan and execute your event perfectly."
    }
  ];

  return (
    <section className="faq-section">
      <h1 className="heading">Frequently Asked Questions</h1>
      
      <div className="faq-container">
        <div className="faq-image">
          <img src={`${process.env.PUBLIC_URL}/assets/images/FAQs.gif`} alt="FAQs" />
        </div>
        
        <div className="faq-content">
          <div className="accordion">
            {faqItems.map((item, index) => (
              <div key={index} className={`accordion-item ${activeIndex === index ? 'active' : ''}`}>
                <div 
                  className="accordion-header"
                  onClick={() => toggleAccordion(index)}
                >
                  <h3>{item.question}</h3>
                  <span className="accordion-icon">
                    <i className={`fas ${activeIndex === index ? 'fa-minus' : 'fa-plus'}`}></i>
                  </span>
                </div>
                <div className={`accordion-body ${activeIndex === index ? 'active' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="contact-info">
            <h3>Still have questions?</h3>
            <p>If you couldn't find the answer to your question, please don't hesitate to contact us:</p>
            <div className="contact-methods">
              <div className="contact-method">
                <i className="fas fa-phone"></i>
                <p>Call us: <a href="tel:+201234567912">+20 123-456-789-12</a></p>
              </div>
              <div className="contact-method">
                <i className="fas fa-envelope"></i>
                <p>Email us: <a href="mailto:info@savoy-sharm.com">info@savoy-sharm.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
