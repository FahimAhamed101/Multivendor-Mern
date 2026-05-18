import { Button, Modal } from "antd";
import JoditEditor from "jodit-react";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaCircleArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import '../../../index.css';
import { useGetTermsQuery, useUpdateTermsMutation } from "../../../redux/features/settings/settingsSlice";
import toast, { Toaster } from "react-hot-toast";

const EditTermCondition = () => {
  const editor = useRef(null);
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: termsData, isLoading: isFetching } = useGetTermsQuery();
  const [updateTerms] = useUpdateTermsMutation();

  // Memoize config to prevent re-render on every keystroke
  const config = useMemo(() => ({
    height: 500,
    placeholder: "Enter terms & conditions content...",
    readonly: false,
    spellcheck: true,
    language: "en",
  }), []);

  // Load existing content when data is fetched
  useEffect(() => {
    if (termsData?.data?.value) {
      setContent(termsData.data.value);
    }
  }, [termsData]);

  const handleUpdateTerms = async () => {
    if (!content.trim()) {
      Modal.warning({
        title: "Validation Error",
        content: "Terms & conditions content cannot be empty.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTerms({ value: content }).unwrap();
      toast.success("Terms & conditions have been updated successfully!");
      setTimeout(() => { 
        navigate("/dashboard/settings/termcondition");
      }, 1000);
    } catch (error) {
      console.error("Update error:", error);
      Modal.error({
        title: "Error",
        content: `Failed to update terms & conditions: ${error?.data?.message || error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading terms & conditions...</span>
      </div>
    );
  }

  return (
    <div className="mx-6">
      <Toaster position="top-right" reverseOrder={false} />
      <Link to='/dashboard/settings/termcondition' className="flex items-center gap-2 mb-6">
        <FaCircleArrowLeft className="text-purple-600 w-8 h-8" />
        <p className="font-semibold text-white text-[30px]">Edit Terms & Conditions</p>
      </Link>

      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Update the terms & conditions content. Use the editor below to format your content.
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
          onClick={() => navigate("/dashboard/settings/termcondition")}
          className="h-[44px] w-[150px] bg-gray-600 text-white rounded-[8px] hover:bg-gray-700"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdateTerms}
          className="h-[44px] w-[200px] !bg-purple-600 !text-white rounded-[8px] hover:!bg-purple-700"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Terms & Conditions"}
        </Button>
      </div>
    </div>
  );
};

export default EditTermCondition;