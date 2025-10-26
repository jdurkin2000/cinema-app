"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EditProfile() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    cards: [] as string[],
    password: "",
    promotions: false,
  });

  useEffect(() => {
    // Fetch user data from API
    axios.get("/api/user/profile").then((res) => {
      setUser(res.data);
    });
  }, []);

  const handleCardChange = (index: number, value: string) => {
    const newCards = [...user.cards];
    newCards[index] = value;
    setUser({ ...user, cards: newCards });
  };

  const addCard = () => {
    if (user.cards.length >= 4) return;
    setUser({ ...user, cards: [...user.cards, ""] });
  };

  const removeCard = (index: number) => {
    const newCards = [...user.cards];
    newCards.splice(index, 1);
    setUser({ ...user, cards: newCards });
  };

  const handleSave = () => {
    if (user.cards.length > 4) {
      alert("You cannot store more than 4 cards.");
      return;
    }
    axios.post("/api/user/profile", user).then(() => {
      alert("Profile updated successfully!");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 space-y-6 font-sans">
      <h1 className="text-4xl font-bold">Edit Profile</h1>

      {/* Personal Info */}
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold">Personal Information</h2>
        <div>
          <label className="block text-sm mb-1">First Name</label>
          <input
            className="w-full p-2 rounded-md text-black"
            value={user.firstName}
            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Last Name</label>
          <input
            className="w-full p-2 rounded-md text-black"
            value={user.lastName}
            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email (cannot edit)</label>
          <input
            className="w-full p-2 rounded-md text-black bg-gray-400 cursor-not-allowed"
            value={user.email}
            readOnly
          />
        </div>
      </div>

      {/* Billing Info */}
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold">Billing Information</h2>
        <div>
          <label className="block text-sm mb-1">Address</label>
          <input
            className="w-full p-2 rounded-md text-black"
            value={user.address}
            onChange={(e) => setUser({ ...user, address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm mb-1">Payment Cards</label>
          {user.cards.map((card, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className="flex-1 p-2 rounded-md text-black"
                value={card}
                onChange={(e) => handleCardChange(idx, e.target.value)}
              />
              <button
                className="bg-red-600 hover:bg-red-700 px-3 rounded-md"
                onClick={() => removeCard(idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-2xl mt-2"
            onClick={addCard}
            disabled={user.cards.length >= 4}
          >
            Add New Card
          </button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold">Account Settings</h2>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 rounded-md text-black"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={user.promotions}
            onChange={(e) =>
              setUser({ ...user, promotions: e.target.checked })
            }
          />
          <span>Subscribe to Promotions</span>
        </div>
      </div>

      {/* Save Button */}
      <button
        className="bg-purple-500 hover:bg-purple-600 transition-colors rounded-2xl px-6 py-3 text-2xl"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
}
