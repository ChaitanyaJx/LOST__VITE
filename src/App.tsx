import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  // Change the state declaration to:
  const [hoveredButton, setHoveredButton] = useState<"lost" | "found" | null>(
    null,
  );
  const handleNavigation = (path: any) => {
    navigate(path);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between bg-black md:max-h-screen`}
    >
      {/* Header */}
      <header className="py-8 px-8 bg-[#CF0F47] text-white rounded-xl mx-10 my-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-5xl text-center font-bold`}>
            CAMPUS ITEM FINDER
          </h1>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-4 py-4 justify-center text-white ">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="container text-center mb-12 "
        >
          <h2 className={`text-5xl font-bold mb-4`}>
            Lost Something? Found Something?
          </h2>
          <p className={`text-xl max-w-2xl mx-auto`}>
            Connect with your campus community to recover lost items or help
            others find theirs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl text-white">
          {/* Lost Item Option */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredButton("lost")}
            onHoverEnd={() => setHoveredButton(null)}
            onClick={() => handleNavigation("/founditems")}
            className={`${
              hoveredButton === "lost" ? "bg-[#CF0F47]" : "bg-[#FF0B55]"
            }
                        rounded-xl p-8 cursor-pointer transition-all duration-300 shadow-lg`}
          >
            <div className="h-40 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mt-4">Find your Item</h3>
            <p className="mt-2">
              Search for your lost items in our Found Items list.
            </p>
          </motion.div>

          {/* Found Item Option */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredButton("found")}
            onHoverEnd={() => setHoveredButton(null)}
            onClick={() => handleNavigation("/founditem")}
            className={`${
              hoveredButton === "found" ? "bg-[#CF0F47]" : "bg-[#FF0B55]"
            }
                        rounded-xl p-8 cursor-pointer transition-all duration-300 shadow-lg`}
          >
            <div className="h-40 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24   text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold   text-white mt-4">
              Found Item Request
            </h3>
            <p className="  text-white mt-2">
              Report an item you've found on campus and help someone recover it.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className={`  text-white text-lg`}>
            Join our community of helpful students and staff!
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className={`py-4 px-8 bg-[#CF0F47] border-t border-[#CF0F47] rounded-xl mx-10 my-4`}
      >
        <div className="text-center">
          <p className={`  text-white text-sm`}>
            © {new Date().getFullYear()} Campus Finder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
