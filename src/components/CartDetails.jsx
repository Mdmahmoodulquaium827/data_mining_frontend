"use client";

export default function CartDetails({
  cartItems = [],
  onRemove,
  onQuantityChange,
}) {
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">

        <h2 className="text-2xl font-bold">
          Your Cart is Empty
        </h2>

        <p className="text-black mt-2">
          You haven't added any products yet.
        </p>

      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">
          Shopping Cart
        </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Products */}
        <div className="lg:col-span-2 space-y-4">

          {cartItems.map((item) => (

            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4"
            >

              {/* Product Image */}
              <div className="bg-gray-100 rounded-lg w-full sm:w-32 h-32 flex-shrink-0 flex items-center justify-center">

                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-contain p-2"
                />

              </div>

              {/* Product Information */}
              <div className="flex-1 min-w-0">

                <h3 className="font-semibold text-lg">
                  {item.title}
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  ${item.price}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-4">

                  <button
                    onClick={() =>
                      onQuantityChange?.(
                        item.id,
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="border rounded-md w-8 h-8 disabled:opacity-40"
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      onQuantityChange?.(
                        item.id,
                        item.quantity + 1
                      )
                    }
                    className="border rounded-md w-8 h-8"
                  >
                    +
                  </button>

                </div>

              </div>

              {/* Price and Remove */}
              <div className="flex sm:flex-col justify-between items-center sm:items-end">

                <p className="font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => onRemove?.(item.id)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* Order Summary */}
        <div className="border border-gray-200 rounded-xl p-5 h-fit">

          <h2 className="text-xl font-bold mb-5">
            Order Summary
          </h2>

          <div className="flex justify-between text-gray-600 mb-4">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600 mb-4">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <button
            className="w-full bg-black text-white rounded-full py-3 mt-6 hover:bg-gray-800 transition"
          >
            Proceed to Checkout
          </button>

        </div>

      </div>
      </div>
    </main>
  );
}