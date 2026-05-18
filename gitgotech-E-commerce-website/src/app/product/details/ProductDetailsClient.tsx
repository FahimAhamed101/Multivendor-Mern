'use client';
import ProductDetails from '@/components/landingPage/ProductDetails';
import { useSearchParams } from 'next/navigation';

const ProductDetailsClient = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  return (
    <div>
      <ProductDetails productId={productId} />
    </div>
  );
};

export default ProductDetailsClient;
