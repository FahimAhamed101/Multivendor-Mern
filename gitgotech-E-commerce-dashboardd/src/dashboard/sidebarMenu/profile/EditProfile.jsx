import { Button, Form, Input, Modal } from "antd";
import { Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LuImagePlus } from "react-icons/lu";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import url from "../../../redux/api/baseUrl";
import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
} from "../../../redux/features/settings/settingsSlice";

const API_BASE_URL =
  url || "https://news-rays-portfolio-starsmerchant.trycloudflare.com";

const EditProfile = () => {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const {
    data: profileData,
    isLoading: isFetching,
    refetch: refetchProfile,
  } = useGetMyProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();

  const user = profileData?.data;

  const getApiImageUrl = (imageName) => {
    if (!imageName) return null;
    if (
      imageName.startsWith("http://") ||
      imageName.startsWith("https://")
    )
      return imageName;
    return `${API_BASE_URL}/${imageName}`;
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name || "",
        address: user.address || "",
      });
      setPreviewUrl(getApiImageUrl(user.image));
    }
  }, [user, form]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleImageClick = () => {
    if (!isSubmitting) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Modal.warning({
        title: "Invalid File",
        content: "Please select a valid image (JPG, PNG, GIF, WEBP)",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Modal.warning({
        title: "File Too Large",
        content: "Image must be smaller than 5MB",
      });
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    setSelectedFile(file);
    const blobUrl = URL.createObjectURL(file);
    objectUrlRef.current = blobUrl;
    setPreviewUrl(blobUrl);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedFile(null);
    setPreviewUrl(getApiImageUrl(user?.image));
  };

  // ✅ FIXED: Build FormData exactly like Postman — image, name, address
  const handleUpdateProfile = async (values) => {
    setIsSubmitting(true);
    console.log(values, selectedFile  );
    try {
      const formData = new FormData();
      formData.append("name", values.name );
      formData.append("address", values.address  || "");
      if (selectedFile) {
        formData.append("image", selectedFile); // key must be "image"
      }

      // ✅ Pass formData directly — NOT wrapped in object
      const result = await updateProfile(formData).unwrap();
      console.log("Update result:", result); 
          setSelectedFile(null);
          refetchProfile();
          navigate("/dashboard/settings/profile"); 
     
    } catch (error) {
      console.error("Update error:", error);
    
    } finally {
      setIsSubmitting(false);
    }
  };

  const FALLBACK_IMAGE = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || "User"
  )}&background=6100FF&color=fff&size=176`;

  const displayImage = previewUrl || FALLBACK_IMAGE;

  if (isFetching || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-white bg-black min-h-screen">
      {/* Back */}
      <div
        onClick={() => navigate("/dashboard/settings/profile")}
        className="flex items-center cursor-pointer mb-8 group w-fit"
      >
        <MdOutlineKeyboardArrowLeft
          size={24}
          className="text-purple-400 group-hover:text-purple-300 transition-colors"
        />
        <h1 className="text-xl font-medium ml-1 group-hover:text-white transition-colors">
          Edit Profile
        </h1>
      </div>

      <div className="relative rounded-xl border border-gray-800">
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 pointer-events-none" />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          className="p-8"
        >
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT — Avatar */}
            <div className="flex flex-col items-center w-full lg:w-1/3">
              
              {/* ✅ Avatar container — overflow-hidden hides file input text */}
              <div className="relative w-48 h-48 rounded-full mt-5">
                
                {/* Avatar Image */}
                <img
                  className="w-48 h-48 rounded-full object-cover border-2 border-purple-600/40"
                  src={displayImage}
                  alt="Profile"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />

                {/* Dark overlay on hover */}
                <div
                  onClick={handleImageClick}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <LuImagePlus size={28} className="text-white" />
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                </div>

                {/* New image uploaded badge */}
                {selectedFile && (
                  <div className="absolute top-1 right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                    <Upload className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* ✅ Hidden file input — completely invisible, triggered by ref */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }} // ✅ use style not className to guarantee hidden
                />
              </div>

              {/* Change Picture Button below avatar */}
              <button
                type="button"
                onClick={handleImageClick}
                disabled={isSubmitting}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <LuImagePlus size={16} />
                Change Picture
              </button>

              {/* Remove new image */}
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <X size={13} /> Remove new image
                </button>
              )}

              {/* User info */}
              <div className="text-center mt-5">
                <p className="text-sm text-purple-400 capitalize font-medium">
                  {user?.role || "user"}
                </p>
                <h1 className="text-xl font-bold mt-1">{user?.name || "User"}</h1>
                <p className="text-gray-400 text-sm mt-1">{user?.email || ""}</p>
                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Verified Account
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT — Form */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Name */}
                <Form.Item
                  label={
                    <span className="text-gray-300 font-medium">Full Name</span>
                  }
                  name="name"
                  rules={[{ required: true, message: "Name is required!" }]}
                >
                  <Input
                    placeholder="Enter your full name"
                    className="custom-input"
                    disabled={isSubmitting}
                  />
                </Form.Item>

                {/* Address */}
                <Form.Item
                  label={
                    <span className="text-gray-300 font-medium">Address</span>
                  }
                  name="address"
                >
                  <Input.TextArea
                    placeholder="Enter your address"
                    rows={5}
                    className="custom-textarea"
                    disabled={isSubmitting}
                    showCount
                    maxLength={250}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            htmlType="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            size="large"
            className="w-full mt-10 !h-12 !bg-purple-600 hover:!bg-purple-700 rounded-lg !text-white font-semibold transition-all shadow-lg disabled:opacity-50 !border-none"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </Form>
      </div>

      <style>{`
        .custom-input {
          background: #1a161e !important;
          border: 1px solid #333 !important;
          color: white !important;
          height: 48px !important;
          padding: 0 16px !important;
          border-radius: 10px !important;
          box-shadow: none !important;
          font-size: 14px !important;
        }
        .custom-input:hover { border-color: #555 !important; }
        .custom-input:focus {
          border-color: #6100FF !important;
          box-shadow: 0 0 0 3px rgba(97,0,255,0.15) !important;
        }
        .custom-input input {
          background: transparent !important;
          color: white !important;
        }
        .custom-textarea {
          background: #1a161e !important;
          border: 1px solid #333 !important;
          color: white !important;
          border-radius: 10px !important;
          box-shadow: none !important;
          font-size: 14px !important;
          padding: 12px 16px !important;
        }
        .custom-textarea:hover { border-color: #555 !important; }
        .custom-textarea:focus {
          border-color: #6100FF !important;
          box-shadow: 0 0 0 3px rgba(97,0,255,0.15) !important;
        }
        .ant-input-textarea-show-count::after {
          color: #666 !important;
        }
        .ant-form-item-label > label { color: #d1d5db !important; }
        .ant-form-item-explain-error { color: #ff4d4f !important; font-size: 13px !important; }
        .ant-modal-content {
          background: #1a161e !important;
          border: 1px solid #333 !important;
          border-radius: 12px !important;
          color: white !important;
        }
        .ant-modal-title { color: white !important; }
        .ant-modal-confirm-content { color: #d1d5db !important; }
      `}</style>
    </div>
  );
};

export default EditProfile;