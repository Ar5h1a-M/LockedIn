import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <main className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/logo.png" alt="LockedIn Logo" width={48} height={48} className={styles.logoImage} />
          <h1 className={styles.logo}>LockedIn</h1>
        </div>
        <div className={styles.headerButtons}>
          <Link href="/login">
            <button className={styles.loginButton}>Log In</button>
          </Link>
          <Link href="/signup">
            <button className={styles.signupButton}>Sign Up</button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Image src="/logo.png" alt="LockedIn Logo" width={96} height={96} className={styles.heroLogo} />
          <h2 className={styles.title}>Your Ultimate Study Buddy</h2>
          <p className={styles.subtitle}>
            LockedIn helps you <strong>find study partners</strong>, 
            <strong> form groups</strong>, and 
            <strong> track your progress</strong> — 
            so you stay motivated and succeed together.
          </p>
          <Link href="/signup">
            <button className={styles.ctaButton}>Get Started - Lock TF In!</button>
          </Link>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <div className={styles.storyText}>
            <h3 className={styles.sectionTitle}>Why We Created LockedIn</h3>
            <div className={styles.storyContent}>
              <p>
                University is already stressful enough. When projects and tests come up, finding the right people 
                to work with can add even more pressure to an already overwhelming situation.
              </p>
              <p>
                We experienced this firsthand. Our group started with just 3 people, and we desperately needed 
                to find 2-3 more members to complete our team. We were stressed, overwhelmed, and didn&apos;t know 
                where to turn.
              </p>
              <p>
                After weeks of asking around and going through friends of friends, we finally met other students 
                who were complete strangers at first. But through collaboration, we discovered the power of 
                working together.
              </p>
              <p className={styles.highlight}>
                With an app like LockedIn, we could have found our teammates sooner, with more trust and ease. 
                That&apos;s exactly what we want to provide for you.
              </p>
            </div>
          </div>
          
          <div className={styles.groupPhotoContainer}>
            <Image 
              src="/group-photo.jpeg" 
              alt="LockedIn Team" 
              width={500} 
              height={500} 
              className={styles.groupPhoto}
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <h3 className={styles.sectionTitle}>Our Mission</h3>
        <p className={styles.missionText}>
          LockedIn is the backbone for students who want to <strong>Lock TF In</strong> 
           and focus on their studies and projects. Whether you need study partners for motivation, 
          teammates for projects, or just want someone to test your knowledge, we&apos;ve got you covered.
        </p>
        <div className={styles.missionQuote}>
          <p>&ldquo;From strangers to study partners - we make academic collaboration effortless.&ldquo;</p>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h3 className={styles.sectionTitle}>What Makes LockedIn Special</h3>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>🤝</div>
            <h4>Find Your Study Tribe</h4>
            <p>
              Connect with like-minded students based on your courses, study goals, and availability. 
              No more awkward cold approaches or relying on friends of friends.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>📅</div>
            <h4>Smart Session Planning</h4>
            <p>
              Organize group study sessions, set reminders, and coordinate schedules seamlessly. 
              Never miss a deadline or study session again.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureEmoji}>📊</div>
            <h4>Track Your Success</h4>
            <p>
              Visualize your study habits, monitor improvement, and celebrate milestones with your study partners. 
              Stay motivated and accountable.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h3 className={styles.ctaTitle}>Ready to Lock In?</h3>
        <p className={styles.ctaText}>
          Join thousands of students who are already studying smarter, not harder.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/signup">
            <button className={styles.ctaPrimary}>Sign Up Free</button>
          </Link>
          <Link href="/about">
            <button className={styles.ctaSecondary}>Learn More</button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Image src="/logo.png" alt="LockedIn Logo" width={32} height={32} />
            <span>LockedIn</span>
          </div>
          <p className={styles.footerText}>
            Helping university students find their study tribe and achieve academic success together.
          </p>
        </div>
      </footer>
    </main>
  );
}





// import React from 'react';

// const LandingPage = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm shadow-sm">
//         <div className="flex items-center space-x-3">
//           {<img src="/logo.png" alt="LockedIn Logo" className="w-12 h-12" /> }
//           <h1 className="text-2xl font-bold text-blue-600">LockedIn</h1>
//         </div>
//         <div className="space-x-4">
//           <button className="px-4 py-2 text-blue-600 hover:text-blue-800 font-semibold">
//             Log In
//           </button>
//           <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
//             Sign Up
//           </button>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="px-6 py-16 text-center max-w-4xl mx-auto">
//         <div className="mb-8">
//           {<img src="/logo.png" alt="LockedIn Logo" className="w-24 h-24 mx-auto mb-6 rounded-2xl" />}
//           <h2 className="text-5xl font-bold text-gray-800 mb-4">Your Ultimate Study Buddy</h2>
//           <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
//             LockedIn helps you <strong className="text-blue-600">find study partners</strong>, 
//             <strong className="text-green-600"> form groups</strong>, and 
//             <strong className="text-yellow-600"> track your progress</strong> — 
//             so you stay motivated and succeed together.
//           </p>
//           <button className="px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-semibold shadow-lg">
//             Get Started - Lock TF In!
//           </button>
//         </div>
//       </section>

//       {/* Our Story Section */}
//       <section className="px-6 py-16 bg-white/60 backdrop-blur-sm">
//         <div className="max-w-6xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-12 items-center">
//             <div>
//               <h3 className="text-3xl font-bold text-gray-800 mb-6">Why We Created LockedIn</h3>
//               <div className="space-y-4 text-gray-600 leading-relaxed">
//                 <p>
//                   University is already stressful enough. When projects and tests come up, finding the right people 
//                   to work with can add even more pressure to an already overwhelming situation.
//                 </p>
//                 <p>
//                   We experienced this firsthand. Our group started with just 3 people, and we desperately needed 
//                   to find 2-3 more members to complete our team. We were stressed, overwhelmed, and didn't know 
//                   where to turn.
//                 </p>
//                 <p>
//                   After weeks of asking around and going through friends of friends, we finally met other students 
//                   who were complete strangers at first. But through collaboration, we discovered the power of 
//                   working together.
//                 </p>
//                 <p className="text-blue-600 font-semibold">
//                   With an app like LockedIn, we could have found our teammates sooner, with more trust and ease. 
//                   That's exactly what we want to provide for you.
//                 </p>
//               </div>
//             </div>
            
//             {<img src="/group-photo.jpg" alt="LockedIn Team" className="w-full max-w-md rounded-2xl shadow-lg mx-auto" />}
//             <div className="flex justify-center">
//               <p className="text-gray-500 italic">Group photo will be added here</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Mission Section */}
//       <section className="px-6 py-16">
//         <div className="max-w-4xl mx-auto text-center">
//           <h3 className="text-3xl font-bold text-gray-800 mb-8">Our Mission</h3>
//           <p className="text-xl text-gray-600 leading-relaxed mb-8">
//             LockedIn is the backbone for students who want to <strong className="text-blue-600">Lock TF In</strong> 
//             and focus on their studies and projects. Whether you need study partners for motivation, 
//             teammates for projects, or just want someone to test your knowledge, we've got you covered.
//           </p>
//           <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
//             <p className="text-lg text-blue-800 font-semibold">
//               "From strangers to study partners - we make academic collaboration effortless."
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="px-6 py-16 bg-gray-50">
//         <div className="max-w-6xl mx-auto">
//           <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">What Makes LockedIn Special</h3>
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
//               <div className="text-4xl mb-4">🤝</div>
//               <h4 className="text-xl font-bold text-gray-800 mb-4">Find Your Study Tribe</h4>
//               <p className="text-gray-600">
//                 Connect with like-minded students based on your courses, study goals, and availability. 
//                 No more awkward cold approaches or relying on friends of friends.
//               </p>
//             </div>
            
//             <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
//               <div className="text-4xl mb-4">📅</div>
//               <h4 className="text-xl font-bold text-gray-800 mb-4">Smart Session Planning</h4>
//               <p className="text-gray-600">
//                 Organize group study sessions, set reminders, and coordinate schedules seamlessly. 
//                 Never miss a deadline or study session again.
//               </p>
//             </div>
            
//             <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
//               <div className="text-4xl mb-4">📊</div>
//               <h4 className="text-xl font-bold text-gray-800 mb-4">Track Your Success</h4>
//               <p className="text-gray-600">
//                 Visualize your study habits, monitor improvement, and celebrate milestones with your study partners. 
//                 Stay motivated and accountable.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
//         <div className="max-w-4xl mx-auto">
//           <h3 className="text-3xl font-bold mb-4">Ready to Lock In?</h3>
//           <p className="text-xl mb-8 opacity-90">
//             Join thousands of students who are already studying smarter, not harder.
//           </p>
//           <div className="space-x-4">
//             <button className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors text-lg font-semibold">
//               Sign Up Free
//             </button>
//             <button className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-colors text-lg font-semibold">
//               Learn More
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="px-6 py-8 bg-gray-800 text-white text-center">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-center space-x-3 mb-4">
//             {<img src="/logo.png" alt="LockedIn Logo" className="w-8 h-8" />}
//             <span className="text-xl font-bold">LockedIn</span>
//           </div>
//           <p className="text-gray-400">
//             Helping university students find their study tribe and achieve academic success together.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default LandingPage;



// "use client";

// import { useRouter } from "next/navigation";
// import styles from "./page.module.css";

// export default function LandingPage() {
//   const router = useRouter();

//   return (
//     <main className={styles.landing}>
//       {/* Header */}
//       <header className={styles.header}>
//         <h1 className={styles.logo}>LockedIn</h1>
//         <button onClick={() => router.push("/login")} className={styles.loginButton}>
//           Log In
//         </button>
//       </header>

//       {/* Hero Section */}
//       <section className={styles.hero}>
//         <h2 className={styles.title}>Your Ultimate Study Buddy</h2>
//         <p className={styles.subtitle}>
//           LockedIn helps you <strong>find study partners</strong>, 
//           <strong> form groups</strong>, and <strong>track your progress</strong> — 
//           so you stay motivated and succeed together.
//         </p>
//         <button
//           className={styles.ctaButton}
//           onClick={() => router.push("/signup")}
//         >
//           Get Started
//         </button>
//       </section>

//       {/* Features Section */}
//       <section className={styles.features}>
//         <div className={styles.featureCard}>
//           <h3>🤝 Find Partners</h3>
//           <p>Connect with like-minded students to study smarter, not harder.</p>
//         </div>
//         <div className={styles.featureCard}>
//           <h3>📅 Plan Sessions</h3>
//           <p>Organize group study sessions and never miss a deadline.</p>
//         </div>
//         <div className={styles.featureCard}>
//           <h3>📊 Track Progress</h3>
//           <p>Visualize your study habits and monitor your improvement.</p>
//         </div>
//       </section>
//     </main>
//   );
// }
