import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import NavigationMenu from "./NavigationMenu";

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToLastList = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const lastListId = userDoc.data().lastListId;
          if (lastListId) {
            navigate(`/grocery-list/${lastListId}`);
          } else {
            navigate("/my-lists");
          }
        } else {
          navigate("/my-lists");
        }
      }
    };

    redirectToLastList();
  }, [navigate]);

  return (
    <div className="home p-4">
      <NavigationMenu />
      <h1 className="text-2xl font-bold mb-6">Redirecting...</h1>
    </div>
  );
};

export default Home;
