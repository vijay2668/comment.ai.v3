import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export const ComponentsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-fit w-full items-center justify-between">
      <button
        onClick={() => navigate(-1)}
        className="group flex h-fit w-fit items-center space-x-1"
      >
        <div className="flex min-h-10 min-w-[5rem] items-center justify-center rounded-lg border border-[#252C36] bg-[#0E1420] transition-colors group-hover:bg-[#1D242E]">
          <IoIosArrowBack className="h-5 w-5" />
        </div>
        {/* <div className="flex h-10 w-fit items-center justify-center rounded-r-lg border border-[#252C36] bg-[#0E1420] px-6 transition-colors group-hover:bg-[#1D242E]">
          <p>Back</p>
        </div> */}
      </button>
    </div>
  );
};
