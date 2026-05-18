import { Button, Modal } from "antd";
import JoditEditor from "jodit-react";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import '../../../index.css';
import { useGetPrivacyQuery, useUpdatePrivacyMutation } from "../../../redux/features/settings/settingsSlice";
import toast, { Toaster } from "react-hot-toast";

const EditPrivacy = () => {
  const editor = useRef(null);
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: privacyData, isLoading: isFetching } = useGetPrivacyQuery();
  const [updatePrivacy] = useUpdatePrivacyMutation();

  // Memoize config to prevent re-render on every keystroke
  const config = useMemo(() => ({
    height: 500,
    placeholder: "Enter privacy policy content...",
    readonly: false,
    spellcheck: true,
    language: "en",
  }), []);

  // Load existing content when data is fetched
  useEffect(() => {
    if (privacyData?.data?.value) {
      setContent(privacyData.data.value);
    }
  }, [privacyData]);

  const handleUpdatePrivacy = async () => {
    if (!content.trim()) {
      Modal.warning({
        title: "Validation Error",
        content: "Privacy policy content cannot be empty.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePrivacy({ value: content }).unwrap();
        toast.success("Privacy policy has been updated successfully!");
      setTimeout(() => { 
        navigate("/dashboard/settings/privacypolicy");
      }, 1000);
    } catch (error) {
      console.error("Update error:", error);
      Modal.error({
        title: "Error",
        content: `Failed to update privacy policy: ${error?.data?.message || error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading privacy policy...</span>
      </div>
    );
  }

  return (
    <div className="mx-6">
      <Toaster  position="top-right" reverseOrder={false} />
      <Link to='/dashboard/settings/privacypolicy' className="flex items-center gap-2 mb-6">
        <FaCircleArrowLeft className="text-purple-600 w-8 h-8" />
        <p className="font-semibold text-white text-[30px]">Edit Privacy Policy</p>
      </Link>

      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Update the privacy policy content. Use the editor below to format your content.
        </p>
      </div>

      <div className="mt-6">
        <JoditEditor
          ref={editor}
          value={content}
          onChange={(newContent) => setContent(newContent)}
          config={config}
        />
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          onClick={() => navigate("/dashboard/settings/privacypolicy")}
          className="h-[44px] w-[150px] bg-gray-600 text-white rounded-[8px] hover:bg-gray-700"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdatePrivacy}
          className="h-[44px] w-[200px] !bg-purple-600 !text-white rounded-[8px] hover:!bg-purple-700"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Privacy Policy"}
        </Button>
      </div>
    </div>
  );
};

export default EditPrivacy;