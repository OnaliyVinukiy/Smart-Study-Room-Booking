import React, { useState, useEffect } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react"; // Import useIsAuthenticated
import { InteractionStatus } from "@azure/msal-browser";
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';

const Home = () => {
  const { instance, accounts, inProgress } = useMsal();
  console.log("Accounts:", accounts);
  console.log("InProgress:", inProgress);
  const isAuthenticated = useIsAuthenticated(); // Use useIsAuthenticated
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [batch, setBatch] = useState("");
  const [intime, setInTime] = useState("");
  const [outtime, setOutTime] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [conflictingBooking, setConflictingBooking] = useState(null);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  
 
  useEffect(() => {
    if (!intime || !outtime) return;
  
    const fetchData = async () => {
      const bookingsRef = firebase.database().ref('bookings');
      const snapshot = await bookingsRef.once('value');
      const bookings = snapshot.val();
      
      if (!bookings) return;
  
      const conflict = Object.values(bookings).find(booking => {
        return (
          booking.date === today &&
          (
            (booking.intime <= intime && intime <= booking.outtime) ||
            (booking.intime <= outtime && outtime <= booking.outtime) ||
            (intime <= booking.intime && booking.intime <= outtime) ||
            (intime <= booking.outtime && booking.outtime <= outtime)
          )
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
  }, [intime, outtime, today]);
  

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isAvailable) {
      firebase.database().ref("bookings").push({
        email,
        studentId,
        fullName,
        batch,
        intime,
        outtime,
        date: today, // Include today's date in the booking
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

  return (
    <div>
    {accounts.length > 0 ? (
      <div>
        <h1>Welcome, {accounts[0].name}</h1>
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
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="text"
              id="date"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '45px', fontSize: '1rem', maxWidth: '100%' }}
              value={today}
              disabled // Disable editing of the date
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
    </div>
    ) : (
      <div>
        {inProgress === InteractionStatus.None && (
          <button onClick={() => instance.loginPopup()}>Login with Microsoft</button>
        )}
      </div>
    )}
    {!isAvailable && conflictingBooking && (
        <p>Study room is already booked until {conflictingBooking.outtime}.</p>
      )}
    </div>
  );
}
export default Home;
