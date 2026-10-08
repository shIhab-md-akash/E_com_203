import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}/`);
        const prodData = res.data.data || res.data;
        setProduct(prodData);
        setSelectedImage(prodData.product_image);
        setQuantity(1);

        // Fetch related products
        if (prodData.category) {
          const relRes = await api.get(`/api/products/?category=${prodData.category}&page_size=4`);
          setRelatedProducts(
            (relRes.data.results || []).filter((p: Product) => p.id !== prodData.id).slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        showToast('Product not found.', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [id, navigate, showToast]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0 || product.status === 'OUT_OF_STOCK';
  const isLowStock = !isOutOfStock && product.stock_quantity <= 5;
  const isFavorite = isInWishlist(product.id);

  const originalPrice = parseFloat(product.price);
  const currentPrice = parseFloat(product.current_price);
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id, quantity);
    setAdding(false);
  };

  const allImages = [product.product_image, ...(product.additional_images || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/products" className="hover:text-white flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
        <span>/</span>
        <span className="text-slate-200 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-2xl">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-lg">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="text-indigo-400 font-semibold tracking-wider uppercase text-xs">
                {product.brand || product.category_details?.name}
              </span>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>4.8</span>
              </div>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400">Verified MySQL Inventory Record</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white font-mono">
                  ${currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-slate-400 line-through font-mono">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Taxes included. Free domestic shipping over $100.
              </div>
            </div>

            {/* Stock status indicator */}
            <div>
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Only {product.stock_quantity} left
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock_quantity})
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Description
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity and Actions */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-300">Quantity:</span>
                <div className="flex items-center border border-slate-700 bg-slate-900 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 py-1.5 text-slate-300 hover:text-white disabled:opacity-30 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="px-3.5 py-1.5 text-slate-300 hover:text-white disabled:opacity-30 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Max: {product.stock_quantity}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{adding ? 'Adding...' : 'Add to Shopping Cart'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isFavorite
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-rose-400'
                  }`}
                  title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Guarantees Box */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Fast Tracked Dispatch</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure Mock Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
