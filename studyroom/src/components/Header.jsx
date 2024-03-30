import React from 'react';
import { useMsal, useMsalAuthentication } from "@azure/msal-react";

function Header() {
  const { instance, accounts } = useMsal();

  const handleLogout = () => {
    instance.logout();
    window.location.href = "http://localhost:3000/"; // Redirect to home page after logout
  };

  // Use useMsalAuthentication to listen for changes in authentication state
  useMsalAuthentication("loginRedirect");

  // Check if the user is logged in and has the specified email address
  // const isLoggedInUser = accounts.length > 0 && accounts[0].username === "ovjayawardana@students.nsbm.ac.lk";
  const isLoggedInUser = accounts.length > 0 && (accounts[0].username === "ovjayawardana@students.nsbm.ac.lk" || accounts[0].username === "jcrashminda@students.nsbm.ac.lk");


  if (accounts.length === 0) {
    return null; // Return nothing if user is not logged in
  }
  return (
    <nav class="bg-white border-gray-200 dark:bg-gray-900">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="https://flowbite.com/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <div style={{ backgroundColor: '#000000', display: 'inline-block', padding: '4px' }}>
            <img src="/favicon.ico" className="h-8" alt="Flowbite Logo" />
        </div>


          <span class="self-center text-2xl font-semibold text-blue-800 whitespace-nowrap dark:text-white">NStudy</span>
        </a>
        <button data-collapse-toggle="navbar-default" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>
        <div class="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul class="font-medium text-xl flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <a href="/" class="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">Book a Studyroom</a>
            </li>
            <li>
              <a href="/Booking" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">My Bookings</a>
            </li>
            
            {isLoggedInUser && (
              <li>
                <a href="/batchpreference" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Dashboard</a>
              </li>
              
            )}
            {isLoggedInUser && (
              <li>
                <a href="/AllBookings" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">All Bookings</a>
              </li>
              
            )}
            <li>
              <a href="/About" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">About Us</a>
            </li>
            <li>
              <a href="/Contact" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Contact Us</a>
            </li>
            <li className="mr-0">
              {accounts.length > 0 ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 mr-0"
                >
                  Logout
                </button>
              ) : (
                <a
                  href="#"
                  onClick={() => instance.loginRedirect()}
                  className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-1.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 mr-0"
                >
                  Login
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
