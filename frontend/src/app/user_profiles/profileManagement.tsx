// src/components/ProfileManagement.tsx
import React, { useState } from "react";
import "./global.css";


const ProfileManagement: React.FC = () => {
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("");
  const [year, setYear] = useState("2");
  const [major, setMajor] = useState("Computer Science");
  const [gpa, setGpa] = useState("");
  const [university, setUniversity] = useState("University of Example");
  const [courses, setCourses] = useState("");
  const [studyInterests, setStudyInterests] = useState<string[]>([
    "Mathematics",
    "Computer Science",
  ]);
  const [bio, setBio] = useState(
    "I enjoy studying in groups and explaining concepts to others. Looking for study partners for CS courses!"
  );
  const [availability, setAvailability] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = (e.currentTarget.value || "").trim().replace(/,+$/, "");
      if (value && !studyInterests.includes(value)) {
        setStudyInterests([...studyInterests, value]);
      }
      e.currentTarget.value = "";
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setStudyInterests(studyInterests.filter((i) => i !== interest));
  };

  const toggleAvailability = (slot: string) => {
    setAvailability((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  return (
    <div>
      <div className="profile-header">
        <div className="logo">LockedIn</div>
        <nav>
          <ul>
            <li>
              <a href="#">Back</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="form-container">
        <h1>Student Profile Management</h1>
        <p className="text-center">
          Create and edit your academic profile to connect with other students
        </p>

        {success && (
          <div className="success">Profile saved successfully!</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="form-section">
            <h3 className="form-title">Personal Information</h3>
            <div className="form-grid">
              <div className="avatar-container full-width">
                <div className="avatar">
                  <div className="avatar-placeholder">
                    {firstName[0]}
                    {lastName[0]}
                  </div>
                </div>
                <button type="button" className="btn-outline">
                  Upload Photo
                </button>
              </div>

              <div>
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="form-section">
            <h3 className="form-title">Academic Information</h3>
            <div className="form-grid">
              <div>
                <label>Year of Study</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                >
                  <option value="">Select your year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                  <option value="5">Fifth Year+</option>
                  <option value="grad">Graduate Student</option>
                </select>
              </div>

              <div>
                <label>Major/Program</label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Current Average</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
              </div>

              <div>
                <label>University</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Courses & Interests */}
          <div className="form-section">
            <h3 className="form-title">Courses & Study Interests</h3>
            <div className="full-width">
              <label>Current Courses</label>
              <input
                type="text"
                value={courses}
                onChange={(e) => setCourses(e.target.value)}
              />
            </div>

            <div className="full-width">
              <label>Study Interests</label>
              <input
                type="text"
                placeholder="e.g. Machine Learning, Physics"
                onKeyDown={handleAddInterest}
              />
              <small>
                These will help others find you for study collaboration
              </small>
            </div>

            <div className="full-width">
              <label>Your Study Interests</label>
              <div className="interests-container">
                {studyInterests.map((interest) => (
                  <div key={interest} className="interest-tag">
                    {interest}
                    <button
                      type="button"
                      className="remove-interest"
                      onClick={() => handleRemoveInterest(interest)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="form-section">
            <h3 className="form-title">Availability</h3>
            <div className="full-width">
              <label>
                When are you typically available for study sessions?
              </label>
              <div className="availability-grid">
                {["Weekday Mornings", "Weekday Afternoons", "Weekday Evenings", "Weekends"].map(
                  (slot) => (
                    <div key={slot}>
                      <input
                        type="checkbox"
                        checked={availability.includes(slot)}
                        onChange={() => toggleAvailability(slot)}
                      />
                      <label>{slot}</label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="form-section">
            <h3 className="form-title">Bio</h3>
            <div className="full-width">
              <label>Short Bio</label>
              <textarea
                rows={4}
                maxLength={250}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <small>Max 250 characters</small>
            </div>
          </div>

          <div className="text-center">
            <button type="submit">Save Profile</button>
            <button type="button" className="btn-outline" style={{ marginLeft: "10px" }}>
              Preview Profile
            </button>
          </div>
        </form>
      </div>

      <footer>
        <p>© 2025 LockedIn | Student Collaboration Platform</p>
      </footer>
    </div>
  );
};

export default ProfileManagement;
