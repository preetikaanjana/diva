import React from 'react';
import './ContactUs.css';

function ContactUs() {
  return (
    <div className="contact-section">
        <h1>Contact Us</h1>
        <p>If you have questions, need assistance, or want to share your story, please reach out to us:</p>
        <ul>
            <li>Email: preetikaanjana@gmail.com</li>
            <li>Phone: +91-626-368-8330</li>
            <li>Address: Ujjain Madhya Pradesh, Village Gunaya</li>
        </ul>

        <h2>Share Your Problem or Concern</h2>
        <form action="#" method="post" className="contact-form">
            <label htmlFor="name">Your Name:</label>
            <input type="text" id="name" name="name" placeholder="Enter your name" required />

            <label htmlFor="email">Your Email:</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required />

            <label htmlFor="topic">Topic of Concern:</label>
            <select id="topic" name="topic" required>
                <option value="Legal Rights">Legal Rights</option>
                <option value="Education">Education</option>
                <option value="Marriage Issues">Marriage Issues</option>
                <option value="Domestic Violence">Domestic Violence</option>
                <option value="Financial Independence">Financial Independence</option>
                <option value="Other">Other</option>
            </select>

            <label htmlFor="message">Your Message:</label>
            <textarea id="message" name="message" rows="5" placeholder="Describe your problem or concern here..." required></textarea>

            <button type="submit" className="submit-button">Submit</button>
        </form>
    </div>
  );
}

export default ContactUs; 