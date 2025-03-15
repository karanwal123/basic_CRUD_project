import React, { useState, useEffect } from "react";
import { getPost, deletePost } from "../api/PostApi";
import Form from "./Form";
import { Edit, Trash2 } from "lucide-react";

const Posts = () => {
  const [data, setData] = useState([]); // ✅ Posts state
  const [loading, setLoading] = useState(true);
  const [updatePost, setUpdatePost] = useState({}); 
  const handle_update_post = (curr_ele) => setUpdatePost(curr_ele);
  const getPostData = async () => {
    try {
      const response = await getPost();
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false); // Stop loading regardless of success or error
    }
  };

  const handleDelete_thatPOST = async (id) => {
    try {
      const res = await deletePost(id);
      if (res.status === 200) {
        const new_updated_posts = data.filter((currPost) => currPost.id !== id);
        setData(new_updated_posts);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  useEffect(() => {
    getPostData();
  }, []);

  if (loading) {
    return <p className="text-center text-white">Loading posts...</p>;
  }

  return (
    <div className="bg-gray-500 flex flex-col min-h-screen">
      <div className="bg-[#AAD7B8] text-4xl flex justify-center items-center p-4 space-x-4 rounded-lg">
        {/* ✅ Pass data and setData to Form */}
        <Form data={data} setData={setData} updatePost={updatePost} setUpdatePost={setUpdatePost} />
        {/* passing as props */}
      </div>

      <div className="bg-gray-300 p-8">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((curr_ele) => {
            const { id, title, body } = curr_ele;

            return (
              <li key={id} className="bg-[#252525] p-6 rounded-lg shadow">
                <p className="text-lg text-white font-mono font-bold">
                  ID: {id}
                </p>
                <p className="text-lg text-white font-mono font-bold">
                  {title}
                </p>
                <p className="text-sm font-mono text-[#E8E8C4]">{body}</p>
                <div className="mt-4 space-x-4 flex">
                  {/* Edit Button */}
                  <button
                    onClick={() => handle_update_post(curr_ele)}
                    className="bg-[#8C3DD0] font-mono font-bold text-white px-4 py-2 rounded-lg flex items-center space-x-2 
    shadow-lg shadow-[#5c249e] active:shadow-none active:translate-y-1 transition-all"
                  >
                    <Edit size={18} />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete_thatPOST(id)}
                    className="bg-red-500 font-mono font-bold text-white px-4 py-2 rounded-lg flex items-center space-x-2 
    shadow-lg shadow-red-700 active:shadow-none active:translate-y-1 transition-all"
                  >
                    <Trash2 size={18} />
                    <span>Delete</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Posts;
