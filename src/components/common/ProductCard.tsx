import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0 || product.status === 'OUT_OF_STOCK';
  const isLowStock = !isOutOfStock && product.stock_quantity <= 5;

  const originalPrice = parseFloat(product.price);
  const currentPrice = parseFloat(product.current_price);
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="group flex flex-col bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-950/20">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-800/50">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.product_image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-600 text-white shadow-md">
              -{discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-md">
              <AlertTriangle className="w-3 h-3" /> Only {product.stock_quantity} left
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-slate-900/70 text-slate-300 hover:text-rose-400 hover:bg-slate-900'
          }`}
          title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Content */}
      <div className="flex-1 flex flex-col p-4 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium text-indigo-400 uppercase tracking-wider text-[10px]">
              {product.brand || product.category_details?.name || 'Exclusive'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
              <Star className="w-3 h-3 fill-current" />
              <span>4.8</span>
            </div>
          </div>

          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-400 line-clamp-1 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg text-white font-mono">
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              SKU: {product.sku}
            </div>
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
