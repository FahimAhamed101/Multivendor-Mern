
import { FaArrowLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";

 
const ErrorPage = () => {
    return (
       
        <div className="flex justify-center items-center w-[1000px] mx-auto">
         
        <Link to = '/dashboard/home'
        className="text-2xl bg-green-400 px-5 py-1 rounded-lg"
        >
        
         <button className="flex items-center"> <FaArrowLeft />home</button>
        </Link>
         
              <img src="https://www.neonrain.com/wp-content/uploads/2022/07/iStock-463353707.jpg" alt=""/>
       
       </div>
    );
};

export default ErrorPage;