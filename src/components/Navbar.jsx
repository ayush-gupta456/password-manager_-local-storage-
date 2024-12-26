import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full text-white bg-slate-800">
      <div className="flex items-center justify-between px-4 py-5 mycontainer h-14">
        <div className="text-2xl font-bold text-white logo">
          <span className="text-purple-400">&lt; </span>
          pass<span className="text-purple-400">KEEPER/ &gt;</span>
        </div>
        {/* <ul>
          <li className="flex gap-4">
            <a className="hover:font-bold" href="/">
              Home
            </a>
            <a className="hover:font-bold" href="#">
              About
            </a>
            <a className="hover:font-bold" href="3">
              Contact
            </a>
          </li>
        </ul> */}
        <button className="flex items-center justify-between mx-2 my-5 text-white bg-purple-700 rounded-full ring-white ring-1">
          <img className="w-10 p-1 invert" src="/icons/github.png" alt="github logo" />
          <span className="px-2 font-bold">GitHub</span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
