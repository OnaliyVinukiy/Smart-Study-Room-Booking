
import React, { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';

const Contact = () => {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get a reference to the database service
    const database = getDatabase();

    // Push data to the 'contacts' node in the Realtime Database
    push(ref(database, 'contacts'), {
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    })
    .then(() => {
      console.log('Data successfully submitted!');
      setFormData({ email: '', subject: '', message: '' });
    })
    .catch((error) => {
      console.error('Error submitting data: ', error);
    });
  };
  return (
    <div
      style={{
        backgroundImage: `url("https://www.nsbm.ac.lk/wp-content/uploads/2021/08/About-Tab-1.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      className="min-h-screen flex flex-col justify-center py-8"
    >
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg mx-auto max-w-md md:max-w-4xl m-20">
        <h1 className="text-2xl md:text-4xl font-bold text-green-800 mb-6 text-center">Contact Us</h1>
        
        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
            <input
              type="email"
              id="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '62.5px', fontSize: '1.5rem', maxWidth: '100%' }}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              id="subject"  
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '62.5px', fontSize: '1.5rem', maxWidth: '100%' }}
              placeholder="Enter the subject"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your message</label>
            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '187.5px', fontSize: '1.5rem', maxWidth: '100%' }}
              placeholder="Enter your message"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition duration-300"
          >
            Send message
          </button>
        </form>

        
      </div>
    </div>
  );
}
export default Contact;