import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';
import { Trash2 } from 'lucide-react';

interface GroceryListData {
  id: string;
  name: string;
  ownerId: string;
}

const MyLists: React.FC = () => {
  const [lists, setLists] = useState<GroceryListData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

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

  const deleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        await deleteDoc(doc(db, 'groceryLists', listId));
        setLists(lists.filter(list => list.id !== listId));
      } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <NavigationMenu />
      <h2 className="text-2xl font-bold mb-6">My Grocery Lists</h2>
      {lists.length === 0 ? (
        <p>You haven't created any lists yet.</p>
      ) : (
        <ul>
          {lists.map((list) => (
            <li key={list.id} className="mb-2 flex justify-between items-center">
              <Link 
                to={`/grocery-list/${list.id}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {list.name}
              </Link>
              <button
                onClick={() => deleteList(list.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Link 
        to="/grocery-list/new" 
        className="mt-4 bg-blue-500 text-white p-2 rounded inline-block hover:bg-blue-600"
      >
        Create New List
      </Link>
    </div>
  );
};

export default MyLists;