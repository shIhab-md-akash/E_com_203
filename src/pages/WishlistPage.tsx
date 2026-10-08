import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, moveToCart, loading } = useWishlist();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-xl">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Your wishlist is empty
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Save your favorite items here to track stock availability or buy later.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {wishlist.items.length} item(s) saved in your personal wishlist
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.items.map((item) => {
          const isOutOfStock = item.product.stock_quantity <= 0;
          return (
            <div
              key={item.id}
              className="flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-all"
            >
              <div className="aspect-square bg-slate-800 overflow-hidden relative">
                <img
                  src={item.product.product_image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-rose-400 backdrop-blur-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                    {item.product.brand || 'Exclusive'}
                  </div>
                  <Link
                    to={`/products/${item.product.id}`}
                    className="font-semibold text-sm text-white hover:text-indigo-400 line-clamp-1 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <div className="text-sm font-bold font-mono text-white mt-1">
                    ${parseFloat(item.product.current_price).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Stock: {item.product.stock_quantity} available
                  </div>
                </div>

                <button
                  onClick={() => moveToCart(item.id)}
                  disabled={isOutOfStock}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isOutOfStock
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Move to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
