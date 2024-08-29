import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, or, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';
import { Trash2 } from 'lucide-react';

interface GroceryListData {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[];
}

const SharedLists: React.FC = () => {
  const [sharedLists, setSharedLists] = useState<GroceryListData[]>([]);

  useEffect(() => {
    fetchSharedLists();
  }, []);

  const fetchSharedLists = async () => {
    const user = auth.currentUser;
    if (user) {
      console.log("Fetching shared lists for user:", user.uid);
      const q = query(
        collection(db, 'groceryLists'),
        or(
          where('sharedWith', 'array-contains', user.uid),
          where('ownerId', '==', user.uid)
        )
      );
      const querySnapshot = await getDocs(q);
      console.log("Query snapshot size:", querySnapshot.size);
      const fetchedLists = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GroceryListData));
      // Filter out lists that the user owns but hasn't shared
      const filteredLists = fetchedLists.filter(list => 
        list.ownerId !== user.uid || list.sharedWith.length > 0
      );
      console.log("Fetched shared lists:", filteredLists);
      setSharedLists(filteredLists);
    }
  };

  const deleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteDoc(doc(db, 'groceryLists', listId));
        setSharedLists(sharedLists.filter(list => list.id !== listId));
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <NavigationMenu />
      <h2 className="text-2xl font-bold mb-6">Shared Grocery Lists</h2>
      {sharedLists.length === 0 ? (
        <p>No shared lists found.</p>
      ) : (
        <ul>
          {sharedLists.map((list) => (
            <li key={list.id} className="mb-2 flex justify-between items-center">
              <Link 
                to={`/grocery-list/${list.id}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {list.name} {list.ownerId === auth.currentUser?.uid ? '(Shared by you)' : ''}
              </Link>
              {list.ownerId === auth.currentUser?.uid && (
                <button
                  onClick={() => deleteList(list.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SharedLists;