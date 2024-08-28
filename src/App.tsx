import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import Profile from "./components/Profile";
import Home from "./components/Home";
import AddPost from "./components/AddPost";
import SignIn from "./components/SignIn";
import { User as FirebaseUser } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";
import GroceryList from "./components/GroceryList";
import SharedLists from "./components/SharedLists";
import MyLists from "./components/MyLists";
import { GroceryItem } from "./types/groceryTypes"; // Import the GroceryItem interface

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GroceryItem[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app flex flex-col min-h-screen">
        <main className="flex-grow">
          {user ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-lists" element={<MyLists />} />
              <Route 
                path="/grocery-list/:listId" 
                element={<GroceryList items={items} setItems={setItems} />} 
              />
              <Route path="/shared-lists" element={<SharedLists />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="*" element={<Navigate to="/signin" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
};

export default App;
