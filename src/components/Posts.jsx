import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getPost, deletePost, updateData } from "../api/PostApi";
import Form from "./Form";
import { Edit, Trash2, Loader } from "lucide-react";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Posts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatePost, setUpdatePost] = useState({});
  const [deleteInProgress, setDeleteInProgress] = useState(null);

  // Refs for animations
  const containerRef = useRef(null);
  const postRefs = useRef([]);
  const timeline = useRef(null);

  // Initialize animation timeline
  useEffect(() => {
    timeline.current = gsap.timeline();

    return () => {
      // Cleanup animations when component unmounts
      if (timeline.current) timeline.current.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Run animations when data changes
  useEffect(() => {
    if (!data.length || loading) return;

    // Reset refs array to match data length
    postRefs.current = postRefs.current.slice(0, data.length);

    // Create fresh timeline
    const tl = gsap.timeline();

    // Reset initial state
    gsap.set(postRefs.current, {
      opacity: 0,
      y: 50,
      scale: 0.95,
      rotationX: 5,
    });

    // Main animation sequence
    tl.to(postRefs.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      clearProps: "transform", // Clean up transforms after animation
    });

    // Create scroll-based animations for items not in initial viewport
    postRefs.current.forEach((el, i) => {
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: "top bottom-=100",
        onEnter: () => {
          if (i > 5) {
            // Only apply to elements beyond the initial visible set
            gsap.fromTo(
              el,
              { opacity: 0, y: 50, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: "power2.out",
                clearProps: "transform",
              }
            );
          }
        },
        once: true,
      });
    });
  }, [data, loading]);

  const handle_update_post = (curr_ele) => {
    // Animate the form when updating
    gsap.to(".form-container", {
      backgroundColor: "#d1e7dd",
      duration: 0.3,
      yoyo: true,
      repeat: 1,
    });

    setUpdatePost(curr_ele);
  };

  const getPostData = async () => {
    try {
      const response = await getPost();
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete_thatPOST = async (id) => {
    // Set deletion in progress for this post
    setDeleteInProgress(id);

    // Animate the post being deleted
    const postEl = postRefs.current.find((_, index) => data[index].id === id);

    if (postEl) {
      // Start delete animation
      await gsap.to(postEl, {
        opacity: 0.5,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
      });
    }

    try {
      const res = await deletePost(id);
      if (res.status === 200) {
        if (postEl) {
          // Complete delete animation
          await gsap.to(postEl, {
            opacity: 0,
            scale: 0.9,
            y: -20,
            duration: 0.4,
            ease: "power3.in",
          });
        }

        // Update state with filtered data
        const new_updated_posts = data.filter((currPost) => currPost.id !== id);
        setData(new_updated_posts);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);

      // Reset animation if failed
      if (postEl) {
        gsap.to(postEl, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      alert("Failed to delete post. Please try again.");
    } finally {
      setDeleteInProgress(null);
    }
  };

  useEffect(() => {
    getPostData();
  }, []);

  // Loading animation
  useEffect(() => {
    if (loading) {
      gsap.to(".loading-text", {
        opacity: 0.5,
        yoyo: true,
        repeat: -1,
        duration: 0.8,
        ease: "power1.inOut",
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
        <div className="relative">
          <Loader className="animate-spin text-white w-12 h-12 mb-4" />
          <p className="loading-text font-semibold text-center text-white text-xl font-mono">
            Loading posts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-500 flex flex-col min-h-screen" ref={containerRef}>
      <div className="form-container bg-[#AAD7B8] text-4xl flex justify-center items-center p-4 space-x-4 rounded-lg">
        <Form
          data={data}
          setData={setData}
          updatePost={updatePost}
          setUpdatePost={setUpdatePost}
        />
      </div>

      <div className="bg-gray-300 p-8">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((curr_ele, index) => {
            const { id, title, body } = curr_ele;
            const isDeleting = deleteInProgress === id;

            return (
              <li
                key={id}
                ref={(el) => (postRefs.current[index] = el)}
                className="bg-[#252525] p-6 rounded-lg shadow transform transition-all hover:scale-105 relative overflow-hidden"
              >
                <p className="text-lg text-white font-mono font-bold">
                  ID: {id}
                </p>
                <p className="text-lg text-white font-mono font-bold">
                  {title}
                </p>
                <p className="text-sm font-mono text-[#E8E8C4]">{body}</p>
                <div className="mt-4 space-x-4 flex">
                  <button
                    onClick={() => handle_update_post(curr_ele)}
                    className="bg-[#8C3DD0] font-mono font-bold text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-[#5c249e] active:shadow-none active:translate-y-1 transition-all"
                    disabled={isDeleting}
                  >
                    <Edit size={18} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete_thatPOST(id)}
                    className="bg-red-500 font-mono font-bold text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-red-700 active:shadow-none active:translate-y-1 transition-all"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                  </button>
                </div>

                {/* Ripple effect overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity hover:opacity-100"></div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Posts;
