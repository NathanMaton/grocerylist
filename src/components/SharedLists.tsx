import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';

interface SharedList {
  id: string;
  name: string;
  ownerId: string;
}

const SharedLists: React.FC = () => {
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'groceryLists'), where('sharedWith', 'array-contains', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const lists: SharedList[] = [];
        querySnapshot.forEach((doc) => {
          lists.push({ id: doc.id, ...doc.data() } as SharedList);
        });
        setSharedLists(lists);
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <NavigationMenu />
      <h2 className="text-2xl font-bold mb-6">Shared Lists</h2>
      {sharedLists.length === 0 ? (
        <p>No shared lists available.</p>
      ) : (
        <ul>
          {sharedLists.map((list) => (
            <li key={list.id} className="mb-2">
              <Link to={`/grocery-list/${list.id}`} className="text-blue-500 hover:underline">
                {list.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharedLists;