import { useGetShowroomProductQuery } from "@/redux/features/home/homeSlice";

const ViewShowroom = () => {
  // TODO: Get showroomId from props or context
  const showroomId = "";
  const { data: showroomProduct } = useGetShowroomProductQuery({
    id: showroomId,
    product_category: "",
  });

  return (
    <div>
      <h1>view showroom product</h1>
    </div>
  );
};

export default ViewShowroom;
