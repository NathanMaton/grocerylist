import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ShoppingCart, Users, CheckSquare } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Welcome to GroceryList
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Simplify your shopping experience with our easy-to-use grocery list app.
          </p>
          <div className="space-y-4 mb-6">
            <Feature icon={<ShoppingCart />} text="Create and manage multiple grocery lists" />
            <Feature icon={<Users />} text="Share lists with family and friends" />
            <Feature icon={<CheckSquare />} text="Check off items as you shop" />
          </div>
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
      </div>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center">
    <div className="flex-shrink-0 text-blue-500 mr-3">
      {icon}
    </div>
    <p className="text-gray-700">{text}</p>
  </div>
);

export default WelcomeScreen;
