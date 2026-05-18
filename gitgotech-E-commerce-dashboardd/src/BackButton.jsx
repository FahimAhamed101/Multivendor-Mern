import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BackHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto flex items-center gap-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
          <FaArrowLeft className="text-black" />
        </div>
      </button>

      <h1 className="text-[32px] font-semibold text-gray-300 font-cormorant">
        {title}
      </h1>
    </div>
  );
};

export default BackHeader;

