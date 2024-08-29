import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ShoppingCart, Users, CheckSquare, ChevronRight } from 'lucide-react';
import logo from '../assets/logo.png'; // Import the logo

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastListId: null,
        });
      }

      navigate("/");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="p-8 md:flex">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <div className="flex justify-center mb-6 animate-bounce">
              <img src={logo} alt="Out of Broccoli Logo" className="w-32 h-32 object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
              Welcome to Out of Broccoli
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Simplify your shopping experience with our easy-to-use grocery list app.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="w-6 h-6 mr-2"
              />
              Sign in with Google
            </button>
          </div>
          <div className="md:w-1/2 md:pl-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Why choose Out of Broccoli?</h2>
            <div className="space-y-4 mb-6">
              <Feature icon={<ShoppingCart className="text-green-500" />} text="Create and manage multiple grocery lists" />
              <Feature icon={<Users className="text-blue-500" />} text="Share lists with family and friends" />
              <Feature icon={<CheckSquare className="text-purple-500" />} text="Check off items as you shop" />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">What our users say:</h3>
              <p className="text-gray-600 italic">"Out of Broccoli has revolutionized the way I shop for groceries. It's a game-changer!" - Sarah K.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-white text-center">
        <p>Join over 100 happy users today!</p>
      </div>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center">
    <div className="flex-shrink-0 mr-3">
      {icon}
    </div>
    <p className="text-gray-700">{text}</p>
  </div>
);

export default WelcomeScreen;
