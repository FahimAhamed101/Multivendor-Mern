import { Outlet, Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Main = () => {
    const authenticated = isAuthenticated();

    // Redirect to login if not authenticated
    if (!authenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className=" bg-black">
             <div className="flex p-4 min-h-screen">
      <div className="fixed z-30 w-[200px] left-3">
       <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">

        <div className=" fixed xl:ml-[310px] lg:ml-[250px] md:ml-[200px] sm:ml-[120px] ml-[120px] w-[75%] mx-auto z-30  lg:w-[calc(98%-300px)]">
         <Header />
        </div>

        <div className="overflow-y-auto ml-8 mt-12 h-full flex-1 bg-black pt-[80px] lg:pl-[280px] md:pl-[220px] sm:pl-[160px] pl-[120px]">
          <Outlet />
        </div>
      </div>

    </div>
        </div>
    );
};

export default Main;

 