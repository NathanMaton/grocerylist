import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const CreateGroceryList: React.FC = () => {
  const [listName, setListName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = await addDoc(collection(db, 'groceryLists'), {
          name: listName,
          ownerId: user.uid,
          createdAt: new Date()
        });
        navigate(`/grocery-list/${docRef.id}`);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6">Create New Grocery List</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Enter list name"
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create List
        </button>
      </form>
    </div>
  );
};

export default CreateGroceryList;