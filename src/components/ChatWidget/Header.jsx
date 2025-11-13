/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

const Header = ({ handleWindow }) => {
  return (
    <motion.div
      className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between"
      layoutId="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
        <div>
          <h3 className="font-semibold text-white">Chat Support</h3>
          <p className="text-sm text-purple-100">
            We typically reply in a few minutes
          </p>
        </div>
      </div>

      <motion.button
        onClick={handleWindow}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default Header;
