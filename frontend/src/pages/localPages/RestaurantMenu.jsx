import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import axios from 'axios';

function RestaurantMenu() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Appetizers');
  const navigate = useNavigate();
  const { cart, quantities, handleQuantityChange, handleAddToCart, clearCart, removeItem } = useOrder();

  // Check for guest token
  const guestToken = localStorage.getItem('guestToken');

  if (!guestToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6">
            <svg 
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v6m0 2v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Access Required</h2>
          <p className="text-gray-600 mb-6">
            Please scan the QR code at your table to access the menu and place orders.
          </p>
          <div className="text-sm text-gray-500">
            If you're a restaurant staff member, please log in through the appropriate portal.
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/getCategories`,
          {
            headers: {
              Authorization: `Bearer ${guestToken}`,
          }
        }
        );
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    };
    getCategories();
  }, []);

  useEffect(() => {
    const getMenuItems = async () => {
    
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/getItems`,
          {
            headers: {
              Authorization: `Bearer ${guestToken}`,
          }
        }
        );
        setMenuItems(response.data.items);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
      }
    };
    getMenuItems();
  }, []);
  console.log('Menu Items:', menuItems); // Debugging line to check the fetched menu items

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((item) => item._id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const handlePlaceOrder = () => {
    if (Object.keys(cart).length === 0) {
      alert('Your cart is empty. Please add items to the cart before placing an order.');
      return;
    }
    navigate('/payment', { 
      state: { 
        total: calculateTotal(),
        menuItems: menuItems 
      } 
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center">Delicious Restaurant</h1>
      <p className="text-center text-gray-600 mt-2">Enjoy our delicious menu and place your order</p>

      {/* Updated Categories Navigation */}
      <div className="relative mt-4">
        <div className="flex overflow-x-auto scrollbar-hide py-2 px-1 bg-gray-100 rounded-lg shadow-md">
          {categories.map((category) => (
            <button
              key={category._id}
              className={`px-4 py-2 mx-1 whitespace-nowrap rounded-md transition-colors ${
                activeCategory === category.name
                  ? 'bg-white font-bold shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
  {menuItems
    .filter((item) => item.category.name === activeCategory)
    .map((menu) => (
      <div key={menu._id} className="border p-8 rounded-lg mt-4">
        <div className="flex justify-between">
          <div className="w-3/4">
            <h2 className="text-lg font-bold">{menu.name}</h2>
            <p className="text-gray-600">{menu.description}</p>
          </div>
          <div className="w-20 h-20 rounded-md overflow-hidden">
            <img
              src={`${import.meta.env.VITE_BASE_URL}${menu.imageUrl}`}
              alt={menu.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80'; // Fallback image
                console.log('Image failed to load:', menu.imageUrl);
              }}
            />
          </div>
        </div>

        <div className="p-6 pt-0 px-0">
          <p className="font-semibold">₹{menu.price.toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="flex gap-4 px-0">
            <button
              className="px-2 py-1 border rounded"
              onClick={() => handleQuantityChange(menu._id, -1)}
            >
              -
            </button>
            <span>{quantities[menu._id] || 0}</span>
            <button
              className="px-2 py-1 border rounded"
              onClick={() => handleQuantityChange(menu._id, 1)}
            >
              +
            </button>
          </div>
          <button
            className={`ml-4 px-4 py-2 rounded ${
              quantities[menu._id]
                ? 'bg-gray-800 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => handleAddToCart(menu._id)}
            disabled={!quantities[menu._id]}
          >
            Add to Cart
          </button>
        </div>
      </div>
    ))}
</div>


      <div className="mt-8 border-t pt-4">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="material-icons mr-2 p-0"></span> Your Order
        </h2>
        {Object.keys(cart).length === 0 ? (
          <p className="text-gray-400 mt-2 p-0">Your cart is empty</p>
        ) : (
          <div className="mt-4">
            {Object.entries(cart).map(([itemId, quantity]) => {
              const item = menuItems.find((item) => item._id === itemId);
              if (!item) return null; // Skip if item not found
              
              return (
                <div key={itemId} className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                    ₹{item.price.toFixed(2)} × {quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-semibold">₹{(item.price * quantity).toFixed(2)}</p>
                    <button
                      className="text-red-500"
                      onClick={() => removeItem(itemId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="border-t pt-4 flex justify-between items-center">
              <p className="font-bold">Total</p>
              <p className="font-bold">₹{calculateTotal().toFixed(2)}</p>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded"
                onClick={handlePlaceOrder}
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add this CSS to hide scrollbar but keep functionality
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);

export default RestaurantMenu;
