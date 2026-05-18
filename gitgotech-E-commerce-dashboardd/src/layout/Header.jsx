
 
import { Link, useNavigate } from "react-router-dom";
import { Menu, Dropdown, Avatar, Badge, Button, Modal, Form, Input } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from "@ant-design/icons";
import logo from "./../../public/image/llogo.png"
import notification from "./../../public/image/notification.png"
import { IoIosNotificationsOutline } from "react-icons/io";
// import { FaRegUser } from "react-icons/fa6";
import './header.css' 
import Swal from "sweetalert2";
import { useState } from "react";
import {  useGetMyProfileQuery } from "../redux/features/settings/settingsSlice";
import url from "../redux/api/baseUrl";
  
 
 
 
 

const Header = () => {

 
  const navigate = useNavigate();
 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [error, setError] = useState('')
  const openModal = () => {
    setIsModalOpen(true);
  };

 const {data: profileData} = useGetMyProfileQuery();
 const user = profileData?.data;
 console.log(user)




  const handleLogOut = () => {
    Swal.fire({
      title: "Are you sure?",
      
      text: "You won't be able to log out from here!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        Swal.fire({
          title: "Logged Out!",
          text: "User has been logged out successfully.",
          icon: "success",
          timer: 2000
        });
        navigate('/');
      }
    });
  };

  const changePassword = async (values) => {
    const { confirmPassword, ...ChangePassword } = values;
    console.log("Form values: ", ChangePassword);
 
  // try{
  //   const res = await passwordChange(ChangePassword).unwrap();
  //   if(res?.code == 200){
  //     setIsModalOpen(false)
  //     toast.success(res?.message)
  //   }
  //   setTimeout(() => { 
  //     navigate('/dashboard/home')
  //   }, 1000);
    
  // }catch(error){
  //   console.log(error.data);
  //   setError(error?.data?.message)
    
  // }
};
 

const handleMenuVisibility = (visible) => {
  setMenuVisible(visible);
};

// const menu = (
//   <Menu className={`transition ease-in-out duration-300 transform ${menuVisible ? 'custom-dropdown-menu-visible' : 'custom-dropdown-menu'}`}>
//     <Menu.Item className=" hover:!bg-[#193664]" key="1">
//       <Link to="dashboard/profile" className=" hover:!bg-[#193664] hover:!text-white">Profile</Link>
//     </Menu.Item>
//     <Menu.Item  className=" hover:!bg-[#193664]" key="2">
//       <p onClick={openModal} className="hover:!bg-[#193664] hover:!text-white">Change Password</p>
//     </Menu.Item>
//     <Menu.Item  className=" hover:!bg-[#193664]" key="3">
//       <p onClick={handleLogOut} className="hover:!bg-[#193664] hover:!text-white">Logout</p>
//     </Menu.Item>
//   </Menu>
// );



  return (
    <div className=" flex justify-between items-center shadow-md border-b-2 mb-[24px] p-[16px] bg-[#0D0D0F] border border-gray-800 rounded-4xl"> 
    {/* <Toaster /> */}
    
     <div className="
     w"> 
      <img src={logo} alt="" />
     </div>

      <div className="flex gap-5 items-center">
        {/* <Dropdown overlay={menu} placement="bottomRight" arrow> */}
        <div
          onClick={(e) => navigate("/dashboard/notification")}
          className="relative flex items-center cursor-pointer"
        >
          <Badge style={{ backgroundColor: "red", marginTop:'10px', marginRight:'5px' }} >
             <img className="h-12 w-12" src={notification} alt="" />
          </Badge>
        </div>
        {/* </Dropdown> */}
        {/* <div
          onClick={() => navigate("/dashboard/profile")}
          className="flex items-center cursor-pointer mr-[30px] bg-primary 
          w rounded-full p-1"
        >
          <FaRegUser className="text-[#Ffff] border-2 border-[#Fffff] rounded-full p-2 w-[52px] h-[52px]" />
        </div> */}
        <div>
        {/* <Dropdown className="px-2" overlay={menu} trigger={['click']} onVisibleChange={handleMenuVisibility}> */}
    <a className="flex items-center 
    w cursor-pointer text-white h-
    wText">
      <Avatar src={`${url}/${user?.image}`} className="mr-2 !h-12 !w-12" />
   
       {user?.name || 'admin'}
    </a>
  {/* </Dropdown> */}
        </div>
        <Modal
          open={isModalOpen}
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <div className="flex flex-col w-[80%] mx-auto ">
            <h2 className="text-[28px] text-left font-semibold mb-4">Change Password</h2>
            <p className="  mb-8 text-gray-600">Your password must be 8-10 character long.</p>
            <Form
              name="changePassword"
              layout="vertical"
              onFinish={changePassword}
             
            >
              <Form.Item
                name="oldPassword"
                label="Old Password"
                rules={[{ required: true, message: "Please enter your old password!" }]}
              >
                <Input.Password
                 style={{
                  height: "40px",
                  background: "#E6F9EF",
                  outline: "none",
                 
                  border: '1px solid green'
                }}
                  placeholder="Old Password"
                  prefix={<LockOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, message: "Please enter your new password!" }]}
              >
                <Input.Password
                   style={{
                    height: "40px",
                    background: "#E6F9EF",
                    outline: "none",
                   
                    border: '1px solid green'
                  }}
                  placeholder="New Password"
                  prefix={<LockOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your new password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords that you entered do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  style={{
                    height: "40px",
                    background: "#E6F9EF",
                    outline: "none",
                   
                    border: '1px solid green'
                  }}
                  placeholder="Confirm Password"
                  prefix={<LockOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
              {/* <p className="text-red-500 font-medium">{error}</p> */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-10 py-3 !bg-[#69C0BE] !text-black text-[16px] rounded-md"
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Header;