import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
 
import { useGetAboutUsQuery, useGetPrivacyQuery, useGetTermsQuery } from "../../../redux/features/settings/settingsSlice";
import toast from "react-hot-toast";
import { useChangePasswordMutation } from "../../../redux/features/authSlice/authSlice";

const Settings = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [changePasswordForm] = useChangePasswordMutation();

  // Fetch settings data for last updated info
  const { data: privacyData } = useGetPrivacyQuery();
  const { data: termsData } = useGetTermsQuery();
  const { data: aboutData } = useGetAboutUsQuery();

  const changePassword = async (values) => {

  const data = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };
  console.log(data);
    try {
   const res =  await changePasswordForm(data).unwrap();
   console.log(res) 
    if (res.success) {
      toast.success("Password changed successfully!");
      navigate("/dashboard/settings");
    }
     

    } catch (error) {
      Modal.error({
        title: "Error",
        content: "Failed to change password.",
      });
    }

    closeModal();
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "Updated just now";
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    if (diffDays < 7) return `Updated ${diffDays}d ago`;
    
    return `Updated ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const settingsItems = [
    { 
      label: "Personal Information", 
      path: "/dashboard/settings/profile",
      icon: null,
      lastUpdated: null 
    },
    { 
      label: "Privacy Policy", 
      path: "/dashboard/settings/privacypolicy",
      lastUpdated: formatDate(privacyData?.data?.updatedAt || privacyData?.data?.createdAt) 
    },
    { 
      label: "Terms and Condition", 
      path: "/dashboard/settings/termcondition",
      lastUpdated: formatDate(termsData?.data?.updatedAt || termsData?.data?.createdAt) 
    },
    { 
      label: "About Us", 
      path: "/dashboard/settings/about",
      lastUpdated: formatDate(aboutData?.data?.updatedAt || aboutData?.data?.createdAt)
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto text-white">
      <h1 className="text-2xl font-bold font-cormorant mb-8">Settings</h1>

      {/* Change Password Card */}
      <div
        onClick={openModal}
        className="cursor-pointer flex justify-between items-center w-full h-[75px] rounded-xl bg-[#0f0c11] border border-gray-800 px-6 mb-6 relative overflow-hidden hover:bg-[#15121a] transition-colors"
      >
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <LockOutlined className="text-purple-400 text-lg" />
          <p className="text-lg font-medium">Change Password</p>
        </div>
        <IoIosArrowForward className="text-gray-400" />
      </div>

      {/* Settings Cards */}
      {settingsItems.map((item, index) => (
        <Link key={index} to={item.path} className="block">
          <div className="cursor-pointer flex justify-between items-center w-full h-[75px] rounded-xl bg-[#0f0c11] border border-gray-800 px-6 mb-6 relative overflow-hidden hover:bg-[#15121a] transition-colors">
            <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none"></div>
            <div className="flex items-center gap-4">
              {item.icon && <span className="text-purple-400">{item.icon}</span>}
              <p className="text-lg font-medium">{item.label}</p>
            </div>
            <div className="flex items-center gap-4">
              {item.lastUpdated && (
                <span className="text-gray-500 text-xs hidden sm:block">{item.lastUpdated}</span>
              )}
              <IoIosArrowForward className="text-gray-400" />
            </div>
          </div>
        </Link>
      ))}

      {/* Change Password Modal */}
      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        className="dark-modal"
        width={500}
      >
        <div className="p-2">
          <h2 className="text-2xl font-semibold mb-2">Change Password</h2>
          <p className="text-gray-400 mb-6">Your password must be 8–10 characters long.</p>

          <Form
            name="changePassword"
            layout="vertical"
            onFinish={changePassword}
            className="space-y-4"
          >
            <Form.Item
              name="oldPassword"
              label={<span className="text-gray-300">Old Password</span>}
              rules={[{ required: true, message: "Please enter your old password!" }]}
            >
              <Input.Password
                placeholder="Old Password"
                prefix={<LockOutlined className="text-gray-400" />}
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={<span className="text-gray-300">New Password</span>}
              rules={[{ required: true, message: "Please enter your new password!" }]}
            >
              <Input.Password
                placeholder="New Password"
                prefix={<LockOutlined className="text-gray-400" />}
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-gray-300">Confirm Password</span>}
              dependencies={["newPassword"]}
              hasFeedback
              rules={[
                { required: true, message: "Please confirm your new password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm Password"
                prefix={<LockOutlined className="text-gray-400" />}
                className="custom-input"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full !h-12 bg-[#6100FF] text-white text-base font-medium rounded-lg"
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Custom Styles for Ant Design in Dark Mode */}
      <style jsx>{`
        .dark-modal .ant-modal-content {
          background: #0f0c11 !important;
          border-radius: 12px;
          border: 1px solid #333;
        }
        .dark-modal .ant-modal-header {
          background: #0f0c11 !important;
          border-bottom: 1px solid #252027 !important;
        }
        .dark-modal .ant-modal-close-x {
          color: #aaa !important;
        }
        .dark-modal .ant-modal-title {
          color: white !important;
          font-weight: bold;
        }
        .custom-input {
          background: #1a161e !important;
          border: 1px solid #333 !important;
          color: white !important;
          height: 44px !important;
        }
        .custom-input:focus,
        .custom-input:hover {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2) !important;
        }
        .ant-input-password input {
          background: transparent !important;
          color: white !important;
        }
        .ant-form-item-label > label {
          color: white !important;
        }
        .ant-form-item-explain-error {
          color: #f87171 !important;
        }
      `}</style>
    </div>
  );
};

export default Settings;