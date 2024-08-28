import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { Home, PlusSquare, LogOut, Edit } from "lucide-react";
import EditPost from "./EditPost";
import NavigationMenu from "./NavigationMenu";

interface Post {
  id: string;
  text: string;
  imageUrl: string | null;
  createdAt: Timestamp;
  userId: string;
}

const Profile: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        // Debug: Log the query
        console.log("Posts query:", postsQuery);

        // Debug: Fetch and log all posts
        const allPostsQuery = query(collection(db, "posts"));
        const allPostsSnapshot = await getDocs(allPostsQuery);
        console.log("All posts:", allPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
          const newPosts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Post[];
          setPosts(newPosts);
          
          // Debug: Log the fetched posts
          console.log("Fetched posts for current user:", newPosts);
        });

        return () => unsubscribePosts();
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleUpdatePost = (newText: string, newImageUrl: string | null) => {
    setPosts(posts.map(p => p.id === editingPost?.id ? { ...p, text: newText, imageUrl: newImageUrl } : p));
  };

  if (!user) {
    return (
      <div className="profile p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
        <p>Please sign in to view your profile.</p>
        <Link
          to="/signin"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="profile p-4 max-w-2xl mx-auto">
      <NavigationMenu />
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="mx-auto max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">Your Posts</h3>
        {posts.length === 0 ? (
          <p className="text-gray-500">You haven't created any posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="post bg-white shadow-md rounded-lg p-4 mb-4 relative"
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full h-64 object-cover rounded-lg mb-2"
                />
              )}
              <p className="text-gray-800">{post.text}</p>
              <p className="text-sm text-gray-500 mt-2">
                {post.createdAt.toDate().toLocaleString()}
              </p>
              <button
                onClick={() => handleEditPost(post)}
                className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition duration-300"
                title="Edit Post"
              >
                <Edit size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      {editingPost && (
        <EditPost
          postId={editingPost.id}
          initialText={editingPost.text}
          initialImageUrl={editingPost.imageUrl}
          onClose={() => setEditingPost(null)}
          onUpdate={handleUpdatePost}
        />
      )}
    </div>
  );
};

export default Profile;
