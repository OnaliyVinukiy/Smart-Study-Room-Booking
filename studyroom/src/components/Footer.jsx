import React from 'react';
import { useMsal } from "@azure/msal-react";


function Footer() {
    const { instance, accounts } = useMsal();
  if (accounts.length === 0) {
    return null; // Return nothing if user is not logged in
  }
  return (
    
      <div style={{ minHeight: "60vh", position: "relative" }}>
      <footer className="p-4 bg-gray-800 md:p-8 lg:p-10 shadow text-white mb-0 absolute bottom-0 w-full">
      
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <a href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <img src="/favicon.ico" className="h-8" alt="Flowbite Logo" />

              <span className="self-center text-2xl font-semibold whitespace-nowrap">NStudy</span>
            </a>
            <ul className="flex flex-wrap items-center justify-center mb-6 font-medium sm:mb-0">
              <li>
                <a href="/" className="hover:underline text-lg md:text-base me-4 md:me-6">Home</a>
              </li>
              <li>
                <a href="/Booking" className="hover:underline text-lg md:text-base me-4 md:me-6">My Booking</a>
              </li>
              <li>
                <a href="/About" className="hover:underline text-lg md:text-base me-4 md:me-6">About Us</a>
              </li>
              <li>
                <a href="/Contact" className="hover:underline text-lg md:text-base">Contact Us</a>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
          <span className="block text-sm text-gray-200 sm:text-center">© 2024 <a href="https://flowbite.com/" className="hover:underline">NStudy</a>. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
