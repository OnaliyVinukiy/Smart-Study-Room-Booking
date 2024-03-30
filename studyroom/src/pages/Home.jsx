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
  // const isAuthenticated = useIsAuthenticated(); // Use useIsAuthenticated
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [batch, setBatch] = useState("");
  const [intime, setInTime] = useState("");
  const [outtime, setOutTime] = useState("");
  const [purpose, setPurpose] = useState("");
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
        purpose,
        date: today, 
        "Access-Granted": "Yes", // Add Access-Granted field with default value
        "Door": "Locked"
      })
      .then(() => {
        console.log("Booking confirmed!");
        setEmail("");
        setStudentId("");
        setFullName("");
        setBatch("");
        setInTime("");
        setOutTime("");
        setPurpose("");
      })
      .catch((error) => {
        console.error("Error adding booking: ", error);
      });
    }
  };
  

  return (
    <div style={{ backgroundImage: `url("https://www.nsbm.ac.lk/wp-content/uploads/2021/08/About-Tab-1.jpg")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} className="min-h-screen flex flex-col justify-center py-8 bg-gray-700">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg mx-auto max-w-md md:max-w-4xl m-20">
        {accounts.length > 0 ? (
          <>
            <h1>Welcome, {accounts[0].name}</h1>
            <h1 className="text-2xl md:text-4xl font-bold text-green-800 mb-6 text-center">Book a Study Room</h1>
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
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea
              id="purpose"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              style={{ width: '100%', height: '100px', fontSize: '1rem', maxWidth: '100%' }}
              placeholder="Enter your purpose of booking the study room"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
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
          </>
        ) : (
          <>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-black md:text-5xl lg:text-6xl text-center">Welcome to Smart Study!</h1>
            <p className="mb-8 text-lg font-normal text-gray-400 lg:text-xl sm:px-16 lg:px-32 text-center">Empowering Your Learning Journey: Reserve Your Study Room at NSBM Green University Now!</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              {inProgress === InteractionStatus.None && (
                <button className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={() => instance.loginPopup()}>
                  Login with Student Email
                  <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default Home;