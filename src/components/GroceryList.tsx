import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PlusCircle, Trash2, Check, X, Share2, Edit } from 'lucide-react';
import NavigationMenu from './NavigationMenu';
import { useParams, useNavigate } from 'react-router-dom';
import { GroceryItem, GroceryListData } from '../types/groceryTypes'; // Import the interfaces

interface GroceryListProps {
  items: GroceryItem[];
  setItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

const GroceryList: React.FC<GroceryListProps> = ({ items, setItems }) => {
  const { listId } = useParams<{ listId?: string }>();
  const navigate = useNavigate();
  const [newItem, setNewItem] = useState('');
  const [listData, setListData] = useState<GroceryListData | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          if (listId === 'new') {
            // Create a new list
            const newListRef = await addDoc(collection(db, 'groceryLists'), {
              name: 'New Grocery List',
              ownerId: user.uid,
              createdAt: new Date(),
              sharedWith: []
            });
            navigate(`/grocery-list/${newListRef.id}`);
          } else if (listId) {
            // Fetch existing list
            const listDocRef = doc(db, 'groceryLists', listId);
            const listDocSnap = await getDoc(listDocRef);
            
            if (listDocSnap.exists()) {
              const listData = listDocSnap.data() as GroceryListData;
              if (listData.ownerId === user.uid || listData.sharedWith.includes(user.uid)) {
                setListData({ ...listData, id: listDocSnap.id });
                // Update the user's lastListId
                await updateDoc(doc(db, 'users', user.uid), { lastListId: listId });
              } else {
                setError("You don't have permission to view this list.");
                navigate('/my-lists');
              }
            } else {
              setError("List not found.");
              navigate('/my-lists');
            }
          }
        } else {
          console.error("No authenticated user");
          setError("Please sign in to view or create a list.");
        }
      } catch (err) {
        console.error("Error fetching or creating grocery list:", err);
        setError(`Failed to load or create grocery list: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    fetchData();
  }, [listId, navigate]);

  useEffect(() => {
    if (listData) {
      console.log("Setting up listener for items in list:", listData.id);
      const q = query(collection(db, 'groceryItems'), where('listId', '==', listData.id));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const groceryItems: GroceryItem[] = [];
        querySnapshot.forEach((doc) => {
          groceryItems.push({ id: doc.id, ...doc.data() } as GroceryItem);
        });
        setItems(groceryItems); // This now uses the setItems from props
        console.log("Updated items:", groceryItems);
      });
      return () => unsubscribe();
    }
  }, [listData?.id, setItems]); // Add setItems to the dependency array

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() === '' || !listData) return;
    await addDoc(collection(db, 'groceryItems'), {
      name: newItem,
      checked: false,
      listId: listData.id,
    });
    setNewItem('');
  };

  const toggleItem = async (id: string, checked: boolean) => {
    await updateDoc(doc(db, 'groceryItems', id), { checked: !checked });
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'groceryItems', id));
  };

  const shareList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim() || !listData) return;

    try {
      const usersQuery = query(collection(db, 'users'), where('email', '==', shareEmail));
      const userSnapshot = await getDocs(usersQuery);

      if (userSnapshot.empty) {
        alert('User not found. Make sure the email is correct and the user has signed in at least once.');
        return;
      }

      const sharedUser = userSnapshot.docs[0];
      const sharedUserId = sharedUser.id;

      // Check if the list is already shared with this user
      if (listData.sharedWith.includes(sharedUserId)) {
        alert('This list is already shared with this user.');
        return;
      }

      const updatedSharedWith = [...listData.sharedWith, sharedUserId];

      await updateDoc(doc(db, 'groceryLists', listData.id), {
        sharedWith: updatedSharedWith
      });

      setListData({ ...listData, sharedWith: updatedSharedWith });
      setShareEmail('');
      alert('List shared successfully');
    } catch (error) {
      console.error('Error sharing list:', error);
      alert('Failed to share list. Please try again.');
    }
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setNewListName(listData?.name || '');
  };

  const handleSaveName = async () => {
    if (!listData || newListName.trim() === '') return;

    try {
      await updateDoc(doc(db, 'groceryLists', listData.id), {
        name: newListName.trim()
      });
      setListData({ ...listData, name: newListName.trim() });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating list name:', error);
      alert('Failed to update list name. Please try again.');
    }
  };

  const renderItems = (items: GroceryItem[], isChecked: boolean) => (
    <ul>
      {items.filter(item => item.checked === isChecked).map((item) => (
        <li key={item.id} className="flex items-center justify-between p-2 border-b">
          <span className={item.checked ? 'line-through' : ''}>{item.name}</span>
          <div>
            <button onClick={() => toggleItem(item.id, item.checked)} className="mr-2">
              {item.checked ? <X size={20} /> : <Check size={20} />}
            </button>
            <button onClick={() => deleteItem(item.id)}>
              <Trash2 size={20} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4">
        <NavigationMenu />
        <h2 className="text-2xl font-bold mb-6">Grocery List</h2>
        <div className="text-red-500">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!listData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <NavigationMenu />
      <div className="flex items-center justify-between mb-6">
        {isEditingName ? (
          <div className="flex items-center">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="border rounded p-1 mr-2"
            />
            <button onClick={handleSaveName} className="bg-green-500 text-white p-1 rounded">
              <Check size={20} />
            </button>
          </div>
        ) : (
          <h2 className="text-2xl font-bold">{listData.name}</h2>
        )}
        <button onClick={handleEditName} className="bg-blue-500 text-white p-2 rounded">
          <Edit size={20} />
        </button>
      </div>
      <form onSubmit={addItem} className="flex mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-grow p-2 border rounded-l"
          placeholder="Add new item"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          <PlusCircle size={24} />
        </button>
      </form>
      
      <h3 className="text-xl font-semibold mb-2">To Buy</h3>
      {renderItems(items, false)}
      
      <h3 className="text-xl font-semibold mt-6 mb-2">Checked Off</h3>
      <div className="bg-gray-100 p-4 rounded-lg">
        {renderItems(items, true)}
      </div>
      
      <form onSubmit={shareList} className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Share List</h3>
        <div className="flex">
          <input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="flex-grow p-2 border rounded-l"
            placeholder="Enter email to share"
          />
          <button type="submit" className="bg-green-500 text-white p-2 rounded-r">
            Share
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroceryList;