import React from 'react';

function Footer() {
  return (
    <div>
      <footer className="bg-gray-500 shadow text-white lm:m-4 md:m-auto">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <a href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
              <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap">Flowbite</span>
            </a>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium sm:mb-0">
              <li>
                <a href="/" className="hover:underline me-4 md:me-6">Home</a>
              </li>
              <li>
                <a href="/Booking" className="hover:underline me-4 md:me-6">My Booking</a>
              </li>
              <li>
                <a href="/About" className="hover:underline me-4 md:me-6">About Us</a>
              </li>
              <li>
                <a href="/Contact" className="hover:underline">Contact Us</a>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
          <span className="block text-sm text-gray-200 sm:text-center">© 2023 <a href="https://flowbite.com/" className="hover:underline">Flowbite™</a>. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
