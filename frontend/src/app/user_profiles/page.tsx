"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import Sidebar from "@/components/Sidebar";

type Friend = {
  id: string;
  full_name: string;
  email: string;
  degree?: string;
  modules?: string[];
  interests?: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ProfileManagement: React.FC = () => {
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [degree, setDegree] = useState("");
  const [modules, setModules] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Friends modal state
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/profile/me`, {
          credentials: "include",
        });
        const data = await res.json();

        setFirstName(data.full_name?.split(" ")[0] || "");
        setLastName(data.full_name?.split(" ")[1] || "");
        setEmail(data.email || "");
        setDegree(data.degree || "");
        setModules(data.modules || []);
        setInterests(data.interests || []);
      } catch (err) {
        console.error("Error loading profile", err);
      }
    };

    fetchProfile();
  }, []);

  // Save profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          full_name: `${firstName} ${lastName}`,
          email,
          degree,
          modules,
          interests,
        }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile", err);
    }
  };

  // Friends fetch
  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API_URL}/api/friends`, {
        credentials: "include",
      });
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      console.error("Error loading friends", err);
    }
  };

  // Open friends modal
  const openFriendsModal = () => {
    fetchFriends();
    setFriendsModalOpen(true);
  };

  return (
    <div className="dashboardLayout">
                <Sidebar />
      <main className="dashboardContent ">
        
      <div className="dashboard-wrapper">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 shadow bg-white">
        <div className="text-xl font-bold">LockedIn</div>
        <button
          onClick={openFriendsModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
        >
          Friends
        </button>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-2">Profile Management</h1>
        <p className="text-gray-600 mb-6">
          Update your academic details to connect with study partners
        </p>

        {success && (
          <div className="p-3 mb-4 bg-green-100 text-green-800 rounded-lg">
            Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two-column grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1 border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full mt-1 border p-2 rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Degree</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full mt-1 border p-2 rounded-lg"
              />
            </div>
          </div>

          {/* Modules */}
          <div>
            <label className="block text-sm font-medium">Modules</label>
            <input
              type="text"
              placeholder="Comma separated e.g. Algorithms, Databases"
              value={modules.join(", ")}
              onChange={(e) =>
                setModules(e.target.value.split(",").map((m) => m.trim()))
              }
              className="w-full mt-1 border p-2 rounded-lg"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium">Interests</label>
            <input
              type="text"
              placeholder="Comma separated e.g. AI, Web Development"
              value={interests.join(", ")}
              onChange={(e) =>
                setInterests(e.target.value.split(",").map((i) => i.trim()))
              }
              className="w-full mt-1 border p-2 rounded-lg"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Friends Modal */}
      <Dialog
        open={friendsModalOpen}
        onClose={() => setFriendsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-lg w-[400px] max-h-[500px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold">
                Your Friends
              </Dialog.Title>
              <button onClick={() => setFriendsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {friends.length === 0 ? (
              <p className="text-gray-500">No friends yet.</p>
            ) : (
              <ul className="space-y-2">
                {friends.map((friend) => (
                  <li
                    key={friend.id}
                    className="p-2 border rounded-lg bg-gray-50"
                  >
                    {friend.full_name} ({friend.email})
                  </li>
                ))}
              </ul>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
      </div>
    </main>
    </div>
  );
};

export default ProfileManagement;
