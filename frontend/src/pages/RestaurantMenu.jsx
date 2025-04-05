import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';

const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'];
const menuItems = [
  {
    category: 'Appetizers',
    items: [
      { id: 1, name: 'Garlic Bread', description: 'Freshly baked bread with garlic butter', price: 4.99, image: '/images/garlic_bread.jpg' },
      { id: 2, name: 'Mozzarella Sticks', description: 'Crispy fried mozzarella with marinara sauce', price: 6.99, image: '/images/mozzarella_sticks.jpg' },
      { id: 3, name: 'Bruschetta', description: 'Toasted bread topped with tomatoes, garlic, and basil', price: 5.99, image: '/images/bruschetta.jpg' },
    ],
  },
  {
    category: 'Main Courses',
    items: [
      { id: 4, name: 'Grilled Chicken', description: 'Juicy grilled chicken with herbs', price: 12.99, image: '/images/grilled_chicken.jpg' },
      { id: 5, name: 'Spaghetti Carbonara', description: 'Classic Italian pasta with creamy sauce', price: 10.99, image: '/images/spaghetti_carbonara.jpg' },
      { id: 6, name: 'Beef Steak', description: 'Tender beef steak with garlic butter', price: 15.99, image: '/images/beef_steak.jpg' },
    ],
  },
  {
    category: 'Desserts',
    items: [
      { id: 7, name: 'Cheesecake', description: 'Creamy cheesecake with a graham cracker crust', price: 6.99, image: '/images/cheesecake.jpg' },
      { id: 8, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center', price: 7.99, image: '/images/chocolate_lava_cake.jpg' },
      { id: 9, name: 'Ice Cream Sundae', description: 'Vanilla ice cream with chocolate syrup and nuts', price: 5.99, image: '/images/ice_cream_sundae.jpg' },
    ],
  },
  {
    category: 'Beverages',
    items: [
      { id: 10, name: 'Coca-Cola', description: 'Chilled Coca-Cola can', price: 1.99, image: '/images/coca_cola.jpg' },
      { id: 11, name: 'Orange Juice', description: 'Freshly squeezed orange juice', price: 3.99, image: '/images/orange_juice.jpg' },
      { id: 12, name: 'Latte', description: 'Hot latte with steamed milk', price: 4.99, image: '/images/latte.jpg' },
    ],
  },
];

function RestaurantMenu() {
  const [activeCategory, setActiveCategory] = useState('Appetizers');
  const navigate = useNavigate();
  const { 
    cart, 
    quantities, 
    handleQuantityChange, 
    handleAddToCart, 
    clearCart, 
    removeItem 
  } = useOrder();

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems
        .flatMap((menu) => menu.items)
        .find((item) => item.id === parseInt(itemId));
      return total + item.price * quantity;
    }, 0);
  };

  const handlePlaceOrder = () => {
    if (Object.keys(cart).length === 0) {
      alert('Your cart is empty. Please add items to the cart before placing an order.');
      return;
    }
    const flatMenuItems = menuItems.flatMap(category => category.items);
    navigate('/payment', { 
      state: { 
        total: calculateTotal(),
        menuItems: flatMenuItems 
      } 
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center">Delicious Restaurant</h1>
      <p className="text-center text-gray-600 mt-2">Enjoy our delicious menu and place your order</p>

      <div className="flex justify-center text-sm mt-4 bg-gray-100 rounded-lg shadow-md py-1">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1 mx-1 border-b-2 ${
              activeCategory === category
                ? 'bg-white font-bold'
                : 'bg-transparent border-transparent text-gray-600'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {menuItems
          .find((menu) => menu.category === activeCategory)
          ?.items.map((item) => (
            <div key={item.id} className="border p-8 rounded-lg mt-4">
              <div className="flex justify-between">
                <div className="w-3/4"> {/* Set a fixed width for the description */}
                  <h2 className="text-lg font-bold">{item.name}</h2>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                <div className="w-20 h-20 rounded-md overflow-hidden">
                  <img
                    src="https://th.bing.com/th/id/OIP.jJI3bTJ-diLfKDHb9-vwmwHaE8?w=248&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="p-6 pt-0 px-0">
                <p className="font-semibold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex gap-4 px-0">
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => handleQuantityChange(item.id, -1)}
                  >
                    -
                  </button>
                  <span>{quantities[item.id] || 0}</span>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => handleQuantityChange(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className={`ml-4 px-4 py-2 rounded ${
                    quantities[item.id]
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => handleAddToCart(item.id)}
                  disabled={!quantities[item.id]}
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
              const item = menuItems
                .flatMap((menu) => menu.items)
                .find((item) => item.id === parseInt(itemId));
              return (
                <div key={itemId} className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                      ${item.price.toFixed(2)} × {quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-semibold">${(item.price * quantity).toFixed(2)}</p>
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
              <p className="font-bold">${calculateTotal().toFixed(2)}</p>
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

export default RestaurantMenu;
