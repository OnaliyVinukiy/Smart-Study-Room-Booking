import React, { useState, useEffect } from "react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

export default function Home() {
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [batch, setBatch] = useState("");
  const [intime, setInTime] = useState("");
  const [outtime, setOutTime] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [conflictingBooking, setConflictingBooking] = useState(null);

  useEffect(() => {
    if (!intime || !outtime) return;

    const fetchData = async () => {
      const bookingsRef = firebase.database().ref('bookings');
      const snapshot = await bookingsRef.once('value');
      const bookings = snapshot.val();
      
      if (!bookings) return;

      const conflict = Object.values(bookings).find(booking => {
        const bookingStartDate = new Date(booking.date + 'T' + booking.intime);
        const bookingEndDate = new Date(booking.date + 'T' + booking.outtime);
        const selectedStartDate = new Date(intime);
        const selectedEndDate = new Date(outtime);

        return (
          (selectedStartDate <= bookingEndDate && selectedEndDate >= bookingStartDate)
        );
      });

      if (conflict) {
        setIsAvailable(false);
        setConflictingBooking(conflict);
      } else {
        setIsAvailable(true);
        setConflictingBooking(null);
      }
    };

    fetchData();
  }, [intime, outtime]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isAvailable) {
      const date = new Date().toISOString().split('T')[0]; // Get current date
      firebase.database().ref("bookings").push({
        email,
        studentId,
        fullName,
        batch,
        date,
        intime,
        outtime,
      })
      .then(() => {
        console.log("Booking confirmed!");
        setEmail("");
        setStudentId("");
        setFullName("");
        setBatch("");
        setInTime("");
        setOutTime("");
      })
      .catch((error) => {
        console.error("Error adding booking: ", error);
      });
    }
  };

  const today = new Date().toISOString().split('T')[0]; // Get current date
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
        <h1 className="text-2xl md:text-4xl font-bold text-green-800 mb-6 text-center">Book a Study Room</h1>
        
        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">NSBM Student Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">NSBM Student Id</label>
            <input
              type="text"
              id="studentId"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter the student Id"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter your name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <input
              type="text"
              id="batch"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter your Batch"
              required
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">In Time</label>
            <input
              type="date"
              id="date"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter In time"
              required
              value={today} max={today}
              onChange={(e) => setInTime(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="intime" className="block text-sm font-medium text-gray-700 mb-1">In Time</label>
            <input
              type="time"
              id="intime"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter In time"
              required
              value={intime}
              onChange={(e) => setInTime(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="outtime" className="block text-sm font-medium text-gray-700 mb-1">Out Time</label>
            <input
              type="time"
              id="outtime"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter date and time"
              required
              value={outtime}
              onChange={(e) => setOutTime(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition duration-300"
          >
            Confirm Booking
          </button>
        </form>

        {!isAvailable && conflictingBooking && (
        <p>Study room is already booked until {conflictingBooking.outtime}.</p>
      )}
      </div>
    </div>
  );
}
