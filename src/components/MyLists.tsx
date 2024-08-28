import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';

interface GroceryListData {
  id: string;
  name: string;
  ownerId: string;
}

const MyLists: React.FC = () => {
  const [lists, setLists] = useState<GroceryListData[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'groceryLists'), where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedLists = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as GroceryListData));
        setLists(fetchedLists);
      }
    };

    fetchLists();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <NavigationMenu />
      <h2 className="text-2xl font-bold mb-6">My Grocery Lists</h2>
      {lists.length === 0 ? (
        <p>You haven't created any lists yet.</p>
      ) : (
        <ul>
          {lists.map((list) => (
            <li key={list.id} className="mb-2">
              <Link 
                to={`/grocery-list/${list.id}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {list.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link 
        to="/create-list" 
        className="mt-4 bg-blue-500 text-white p-2 rounded inline-block hover:bg-blue-600"
      >
        Create New List
      </Link>
    </div>
  );
};

export default MyLists;