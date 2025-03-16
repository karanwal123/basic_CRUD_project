import React, { useState, useEffect } from "react";
import { PostData } from "../api/PostApi";
import { updateData } from "../api/PostApi";
const Form = ({ data = [], setData, updatePost = {}, setUpdatePost }) => {
  const [addData, setAddData] = useState({
    title: "",
    body: "",
  });

  let isEmpty = Object.keys(updatePost || {}).length === 0;

  useEffect(() => {
    if (updatePost) {
      setAddData({
        title: updatePost.title || "",
        body: updatePost.body || "",
      });
    }
  }, [updatePost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const add_post_data = async () => {
    try {
      const response = await PostData(addData);
      if (response.status === 201) {
        setData((prevData) =>
          Array.isArray(prevData)
            ? [...prevData, response.data]
            : [response.data]
        );
        setAddData({ title: "", body: "" });
        setUpdatePost(null);
      }
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };
  const update_post_data = async () => {
    try {
      const res = await updateData(updatePost.id, addData); // ✅ Correct API call

      console.log(res);

      if (res.status === 200) {
        setData((prev) =>
          prev.map((curr_ele) =>
            curr_ele.id === updatePost.id
              ? { ...curr_ele, ...res.data }
              : curr_ele
          )
        );
      }
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const handle_form_submit = (e) => {
    e.preventDefault();
    const action = e.nativeEvent.submitter.value;
    if (action === "ADD") add_post_data();
    else update_post_data();
  };

  return (
    <form onSubmit={handle_form_submit}>
      <div className="flex items-center space-x-4 p-4 bg-[#AAD7B8] rounded-lg">
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Add Title"
          value={addData.title}
          onChange={handleInputChange}
          className="text-base p-2 rounded border-2 border-black focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          id="body"
          name="body"
          placeholder="Add Description"
          value={addData.body}
          onChange={handleInputChange}
          className="text-base p-2 rounded border-2 border-black focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          value={isEmpty ? "ADD" : "UPDATE"}
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded-lg border-2 border-black hover:bg-green-600 transition"
        >
          {isEmpty ? "ADD" : "UPDATE"}
        </button>
      </div>
    </form>
  );
};

export default Form;
