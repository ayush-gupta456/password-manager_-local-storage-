import { default as React, useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();
  const [form, setForm] = useState({ site: "", username: "", password: "", id: null });
  const [passwordArray, setPasswordArray] = useState([]);

  // Fetch passwords from backend
  const getPasswords = async () => {
    try {
      let req = await fetch("http://localhost:5000/");
      let passwords = await req.json();
      setPasswordArray(passwords);
    } catch (error) {
      console.error("Error fetching passwords:", error);
      toast.error("Failed to load passwords from server.");
    }
  };

  useEffect(() => {
    getPasswords();
  }, []);

  // Copy text to clipboard
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Show/Hide password toggle
  const showPassword = () => {
    if (passwordRef.current.type === "password") {
      passwordRef.current.type = "text";
      ref.current.src = "icons/eyecross.png";
    } else {
      passwordRef.current.type = "password";
      ref.current.src = "icons/eye.png";
    }
  };

  // Save new password
  const savePassword = async () => {
    if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
      const newPassword = { ...form };

      try {
        let res = await fetch("http://localhost:5000/", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPassword),
        });

        if (res.ok) {
          setPasswordArray([...passwordArray, newPassword]);
          setForm({ site: "", username: "", password: "", id: null });
          toast.success("Password Saved!");
        } else {
          throw new Error("Failed to save password");
        }
      } catch (error) {
        console.error("Error saving password:", error);
        toast.error("Could not save password.");
      }
    } else {
      toast.error("Error: Password not saved! Fields must be at least 4 characters.");
    }
  };

  // Delete a password
  const deletePassword = async (id) => {
    let confirmDelete = window.confirm("Do you really want to delete this password?");
    if (confirmDelete) {
      const newPasswordArray = passwordArray.filter(item => item._id !== id);
      setPasswordArray(newPasswordArray);

      try {
        let res = await fetch(`http://localhost:5000/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          setPasswordArray(passwordArray); // Revert to original state if error occurs
          throw new Error("Failed to delete password");
        }

        toast.success("Password Deleted!");
      } catch (error) {
        console.error("Error deleting password:", error);
        toast.error("Could not delete password.");
      }
    }
  };

  // Edit a password
  const editPassword = async (id) => {
    const selectedPassword = passwordArray.find(item => item._id === id);
    setForm({ site: selectedPassword.site, username: selectedPassword.username, password: selectedPassword.password, id: selectedPassword._id });

    // Remove the old password from the state for optimistic UI update
    const updatedPasswordArray = passwordArray.filter(item => item._id !== id);
    setPasswordArray(updatedPasswordArray);
  };

  // Update the password
  const updatePassword = async () => {
    if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
      const updatedPassword = { ...form };
  
      try {
        let res = await fetch(`http://localhost:5000/passwords/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPassword),
        });

        if (res.ok) {
          // Fetch the updated record to avoid data inconsistencies
          const updatedPasswordData = await res.json();
          setPasswordArray(prevState => 
            prevState.map(item => item._id === updatedPasswordData._id ? updatedPasswordData : item)
          );
          setForm({ site: "", username: "", password: "", id: null }); // Reset form
          toast.success("Password Updated!");
        } else {
          throw new Error("Failed to update password");
        }
      } catch (error) {
        console.error("Error updating password:", error);
        toast.error("Could not update password.");
      }
    } else {
      toast.error("Error: Password not updated! Fields must be at least 4 characters.");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="dark" />
      
      <div className="p-3 md:mycontainer min-h-[80.7vh]">
        <h1 className="text-4xl font-bold text-center">
          <span className="text-purple-400">&lt; </span>pass<span className="text-purple-500">KEEPER/ &gt;</span>
        </h1>
        <p className="text-lg text-center text-purple-900">Your own Password Manager</p>

        {/* Input Fields */}
        <div className="flex flex-col items-center gap-6 p-4">
          <input value={form.site} onChange={handleChange} placeholder="Enter website URL*" className="w-full p-4 py-1 border border-purple-500 rounded-full" type="text" name="site" />

          <div className="flex flex-col w-full gap-4 md:flex-row">
            <input value={form.username} onChange={handleChange} placeholder="Enter Username*" className="w-full p-4 py-1 border border-purple-500 rounded-full" type="text" name="username" />

            <div className="relative">
              <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder="Enter Password*" className="w-full p-4 py-1 border border-purple-500 rounded-full" type="password" name="password" />
              <span className="absolute right-[3px] top-[4px] cursor-pointer" onClick={showPassword}>
                <img ref={ref} className="p-1" width={26} src="icons/eyecross.png" alt="eye" />
              </span>
            </div>
          </div>

          <button onClick={form.id ? updatePassword : savePassword} className="px-8 py-2 text-white bg-blue-600 border border-purple-700 rounded-full hover:bg-purple-300">
            {form.id ? "Update" : "Save"}
          </button>
        </div>

        {/* Password List */}
        <div className="passwords">
          <h2 className="py-4 text-xl font-bold">Your Passwords</h2>
          {passwordArray.length === 0 ? <div>No passwords to show</div> : 
            <table className="w-full mb-10 overflow-hidden rounded-md table-auto">
              <thead className="text-white bg-blue-600">
                <tr>
                  <th>Site</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-purple-200">
                {passwordArray.map((item, index) => (
                   <tr key={index}>
                   <td className="py-2 text-center border border-white">
                     <div className="flex items-center justify-center">
                       <a href={item.site} target="_blank" >{item.site}</a>
                       <div className="cursor-pointer lordiconcopy size-7" onClick={() => { copyText(item.site) }} >
                         <lord-icon
                           style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                           src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover">
                         </lord-icon>
                       </div>
                     </div>
                   </td>
                   <td className="py-2 text-center border border-white">
                     <div className="flex items-center justify-center">{item.username}
                       <div className="cursor-pointer lordiconcopy size-7" onClick={() => { copyText(item.username) }} >
                         <lord-icon
                           style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                           src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover">
                         </lord-icon>
                       </div>
                     </div>
                   </td>
                   <td className="py-2 text-center border border-white">
                     <div className="flex items-center justify-center">{item.password}
                       <div className="cursor-pointer lordiconcopy size-7" onClick={() => { copyText(item.password) }} >
                         <lord-icon
                           style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                           src="https://cdn.lordicon.com/iykgtsbt.json" trigger="hover">
                         </lord-icon>
                       </div>
                     </div>
                   </td>
                   <td className="justify-center py-2 text-center border border-white">
                     <span className="mx-1 cursor-pointer " onClick={() => { editPassword(item._id) }} >
                       <lord-icon
                         src="https://cdn.lordicon.com/gwlusjdu.json"
                         trigger="hover"
                         style={{ "width": "25px", "height": "25px" }}
                       >
                       </lord-icon> </span>
                     <span className="mx-1 cursor-pointer" onClick={() => { deletePassword(item._id) }} >
                       <lord-icon
                         src="https://cdn.lordicon.com/skkahier.json"
                         trigger="hover"
                         style={{ "width": "25px", "height": "25px" }}
                       >
                       </lord-icon> </span>
                   </td>
                 </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </div>
    </>
  );
};

export default Manager;
