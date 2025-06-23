import React, { useState, useEffect, useCallback, JSX } from 'react';

const __app_id = undefined;
// Global variables provided by the Canvas environment (not used for Firebase anymore, but keeping for structure)
const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Define Product Interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  galleryUrls: string[];
  status: 'inactivo' | 'habilitado' | 'vendido';
}

// Dummy data for products - Used to initialize localStorage if empty
const dummyProducts: Product[] = [
  {
    id: '1',
    name: 'Jarrón de Cerámica Antigua',
    description: 'Un hermoso jarrón de cerámica hecho a mano con patrones únicos, perfecto para cualquier colección. Pieza única.',
    price: 120.00,
    imageUrl: 'https://placehold.co/400x300/F2F2F2/7F7F7F?text=Jarron+Antiguo',
    galleryUrls: [
      'https://placehold.co/400x300/F2F2F2/7F7F7F?text=Jarron+Vista+1',
      'https://placehold.co/400x300/F2F2F2/7F7F7F?text=Jarron+Vista+2',
      'https://placehold.co/400x300/F2F2F2/7F7F7F?text=Jarron+Vista+3',
    ],
    status: 'inactivo', // Initial status for admin control
  },
  {
    id: '2',
    name: 'Escultura Abstracta de Bronce',
    description: 'Escultura de bronce moderna, ideal para realzar la decoración de espacios contemporáneos. Edición limitada a 1.',
    price: 350.00,
    imageUrl: 'https://placehold.co/400x300/D9D9D9/4D4D4D?text=Escultura+Bronce',
    galleryUrls: [
      'https://placehold.co/400x300/D9D9D9/4D4D4D?text=Escultura+Vista+1',
      'https://placehold.co/400x300/D9D9D9/4D4D4D?text=Escultura+Vista+2',
    ],
    status: 'inactivo',
  },
  {
    id: '3',
    name: 'Reloj de Bolsillo Vintage',
    description: 'Elegante reloj de bolsillo de principios del siglo XX, en perfecto estado de funcionamiento. Una joya para coleccionistas.',
    price: 200.00,
    imageUrl: 'https://placehold.co/400x300/BFBFBF/2A2A2A?text=Reloj+Vintage',
    galleryUrls: [
      'https://placehold.co/400x300/BFBFBF/2A2A2A?text=Reloj+Vista+1',
      'https://placehold.co/400x300/BFBFBF/2A2A2A?text=Reloj+Vista+2',
      'https://placehold.co/400x300/BFBFBF/2A2A2A?text=Reloj+Vista+3',
    ],
    status: 'inactivo',
  },
  {
    id: '4',
    name: 'Set de Tazas de Té Japonesas',
    description: 'Exclusivo set de té de cerámica japonesa, pintado a mano. Perfecto para amantes del té. Solo un set disponible.',
    price: 85.00,
    imageUrl: 'https://placehold.co/400x300/E6E6E6/6B6B6B?text=Set+Te+Japones',
    galleryUrls: [
      'https://placehold.co/400x300/E6E6E6/6B6B6B?text=Set+Te+Vista+1',
      'https://placehold.co/400x300/E6E6E6/6B6B6B?text=Set+Te+Vista+2',
    ],
    status: 'inactivo',
  },
];

// --- MOCK API SERVICE USING LOCALSTORAGE ---
const STORAGE_KEY: string = `mockProducts_${appId}`; // Unique key for this app's products in localStorage

// Helper to get products from localStorage
const getStoredProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data) as Product[];
  }
  // If no data, initialize with dummy products
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyProducts));
  return dummyProducts;
};

// Helper to set products to localStorage
const setStoredProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  // Dispatch a custom event to notify other parts of the app (or other tabs)
  // that localStorage has changed. This simulates Firestore's real-time updates.
  window.dispatchEvent(new Event('localStorageUpdate'));
};

// Mock API Call: Fetch all products
const mockFetchProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredProducts());
    }, 500); // Simulate network delay
  });
};

// Mock API Call: Buy a product (change its status to 'vendido')
const mockBuyProduct = (productId: string): Promise<{ success: boolean; product?: Product; message?: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let products = getStoredProducts();
      const productIndex = products.findIndex(p => p.id === productId);

      if (productIndex !== -1 && products[productIndex].status === 'habilitado') {
        products[productIndex].status = 'vendido';
        setStoredProducts(products);
        resolve({ success: true, product: products[productIndex] });
      } else {
        reject({ success: false, message: 'Producto no disponible o ya vendido.' });
      }
    }, 300); // Simulate network delay for purchase
  });
};

// Mock API Call: Toggle product status (habilitado/inactivo)
const mockToggleProductStatus = (productId: string, currentStatus: Product['status']): Promise<{ success: boolean; product?: Product; message?: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let products = getStoredProducts();
      const productIndex = products.findIndex(p => p.id === productId);

      if (productIndex !== -1) {
        products[productIndex].status = currentStatus === 'habilitado' ? 'inactivo' : 'habilitado';
        setStoredProducts(products);
        resolve({ success: true, product: products[productIndex] });
      } else {
        reject({ success: false, message: 'Producto no encontrado.' });
      }
    }, 200); // Simulate network delay for status toggle
  });
};

// Mock API Call: Create a new product
const mockCreateProduct = (newProductData: Omit<Product, 'id' | 'status'>): Promise<{ success: boolean; product?: Product; message?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let products = getStoredProducts();
      // Generate a simple unique ID (for mock purposes)
      const newId = (products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1).toString();
      const productToAdd: Product = { id: newId, ...newProductData, status: 'inactivo' };
      products.push(productToAdd);
      setStoredProducts(products);
      resolve({ success: true, product: productToAdd });
    }, 400); // Simulate network delay for creation
  });
};
// --- END MOCK API SERVICE ---


// Helper to determine if sales are open based on a simulated schedule
const isSalesOpen = (): boolean => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday...
  const currentHour = now.getHours();

  // Simulate sales from Monday to Friday, 10 AM to 5 PM
  const salesDays = [1, 2, 3, 4, 5]; // Monday to Friday
  const salesStartTime = 10; // 10 AM
  const salesEndTime = 17; // 5 PM

  const isWithinSalesHours = currentHour >= salesStartTime && currentHour < salesEndTime;
  const isSalesDay = salesDays.includes(dayOfWeek);

  return isSalesDay && isWithinSalesHours;
};

// Calculate time until next sales open (simple simulation)
const getTimeUntilNextOpen = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  let nextOpen = new Date();
  nextOpen.setHours(10, 0, 0, 0); // Next 10 AM

  // If already past 5 PM today, or weekend, move to next Monday 10 AM
  if (now.getHours() >= 17 || now.getDay() === 0 || now.getDay() === 6) {
    nextOpen.setDate(now.getDate() + (8 - now.getDay()) % 7); // Go to next Monday
    if (nextOpen.getDay() === 0) nextOpen.setDate(nextOpen.getDate() + 1); // If it's still Sunday, add one more day
  }

  // If nextOpen is in the past (e.g., it's 9 AM, but 10 AM today), move to tomorrow 10 AM
  if (nextOpen.getTime() < now.getTime()) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }

  const diff = nextOpen.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [salesStatus, setSalesStatus] = useState<boolean>(isSalesOpen());
  const [timeUntilOpen, setTimeUntilOpen] = useState<{ hours: number; minutes: number; seconds: number }>(getTimeUntilNextOpen());
  const [userId] = useState<string>('mock-user-id'); // Hardcoded mock user ID
  const [products, setProducts] = useState<Product[]>([]);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [messageContent, setMessageContent] = useState<string>('');
  const [isAdminView, setIsAdminView] = useState<boolean>(false); // New state for admin view

  // Update sales status and countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSalesStatus(isSalesOpen());
      setTimeUntilOpen(getTimeUntilNextOpen());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products from mock API and listen for localStorage updates
  const fetchProductsAndListen = useCallback(async (): Promise<void> => {
    try {
      const fetchedProducts = await mockFetchProducts();
      setProducts(fetchedProducts);
      console.log("Products fetched from mock API:", fetchedProducts);
    } catch (error: any) { // Type 'any' because mock API error can be anything
      console.error("Error fetching products from mock API:", error);
    }
  }, []);

  useEffect(() => {
    fetchProductsAndListen();

    // Listen for custom localStorage update event (simulates real-time updates across tabs)
    window.addEventListener('localStorageUpdate', fetchProductsAndListen);

    return () => {
      window.removeEventListener('localStorageUpdate', fetchProductsAndListen);
    };
  }, [fetchProductsAndListen]);

  const handleBuyNow = async (product: Product): Promise<void> => {
    try {
      await mockBuyProduct(product.id);
      showMessageBox(`¡Felicidades! Has comprado "${product.name}". ¡Es único!`);
      // Re-fetch products to update UI
      fetchProductsAndListen();
      setCurrentPage('products');
    } catch (error: any) {
      console.error("Error buying product:", error);
      showMessageBox(error.message || 'Error al intentar comprar el artículo.');
    }
  };

  const handleToggleProductStatus = async (product: Product): Promise<void> => {
    try {
      await mockToggleProductStatus(product.id, product.status);
      showMessageBox(`Estado de "${product.name}" cambiado a: ${product.status === 'habilitado' ? 'Inactivo' : 'Habilitado'}.`);
      // Re-fetch products to update UI
      fetchProductsAndListen();
    } catch (error: any) {
      console.error("Error updating product status (admin):", error);
      showMessageBox(error.message || `Error al cambiar el estado de "${product.name}".`);
    }
  };

  const handleCreateProduct = async (newProductData: Omit<Product, 'id' | 'status'>): Promise<void> => {
    try {
      await mockCreateProduct(newProductData);
      showMessageBox(`¡Artículo "${newProductData.name}" creado exitosamente!`);
      // Re-fetch products to update UI
      fetchProductsAndListen();
      setCurrentPage('admin-panel'); // Go back to admin panel after creation
    } catch (error: any) {
      console.error("Error creating new product:", error);
      showMessageBox('Error al crear el nuevo artículo.');
    }
  };

  const showMessageBox = (message: string): void => {
    setMessageContent(message);
    setShowMessage(true);
  };

  const closeMessageBox = (): void => {
    setShowMessage(false);
    setMessageContent('');
  };

  const renderPage = (): JSX.Element | null => {
    if (isAdminView) {
      switch (currentPage) {
        case 'admin-panel':
          return (
            <div className="container mx-auto p-6 min-h-[calc(100vh-8rem)]">
              <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center rounded-lg p-2 bg-blue-100">
                Panel de Administración
              </h1>
              <div className="mb-6 bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-xl font-semibold text-blue-800 mb-2">
                  Horario de Venta Simulado: Lunes a Viernes, 10:00 AM - 5:00 PM (Hora Local)
                </p>
                <p className="text-blue-700">
                  Estado Actual de Ventas: <span className={`font-bold ${salesStatus ? 'text-green-600' : 'text-red-600'}`}>
                    {salesStatus ? 'ABIERTAS' : 'CERRADAS'}
                  </span>
                </p>
              </div>
              {userId && (
                <p className="mb-6 text-gray-600 text-md text-center">
                  ID de Usuario (Admin): <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-sm">{userId}</span>
                </p>
              )}

              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setCurrentPage('create-item')}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                >
                  + Crear Nuevo Artículo
                </button>
              </div>

              <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                      products.map((product: Product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden">
                                <img
                                  className="h-10 w-10 object-cover"
                                  src={product.imageUrl}
                                  alt={product.name}
                                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/40x40/F2F2F2/7F7F7F?text=N/A`; }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'habilitado' ? 'bg-green-100 text-green-800' :
                                product.status === 'inactivo' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {product.status === 'habilitado' ? 'Habilitado' :
                                product.status === 'inactivo' ? 'Inactivo' :
                                  'Vendido'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {product.status !== 'vendido' ? (
                              <button
                                onClick={() => handleToggleProductStatus(product)}
                                className={`px-4 py-2 rounded-md text-white font-semibold transition duration-200
                                  ${product.status === 'habilitado' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                              >
                                {product.status === 'habilitado' ? 'Deshabilitar' : 'Habilitar'}
                              </button>
                            ) : (
                              <span className="text-gray-500">No disponible</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          Cargando productos o no hay productos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        case 'create-item':
          return (
            <CreateItemPage onBack={() => setCurrentPage('admin-panel')} onCreate={handleCreateProduct} showMessageBox={showMessageBox} />
          );
        default:
          return null;
      }
    } else { // Customer View
      switch (currentPage) {
        case 'home':
          return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 rounded-lg p-2">
                Tienda de Artículos Únicos
              </h1>
              <div className={`p-6 rounded-xl shadow-xl w-full max-w-md ${salesStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <h2 className="text-3xl font-semibold mb-4">
                  Ventas Actualmente: <span className="font-extrabold">{salesStatus ? '¡ABIERTAS!' : 'CERRADAS'}</span>
                </h2>
                {salesStatus ? (
                  <p className="text-lg">¡Aprovecha, los artículos son únicos y vuelan!</p>
                ) : (
                  <>
                    <p className="text-xl mb-3">Próxima apertura en:</p>
                    <div className="text-4xl font-mono">
                      {timeUntilOpen.hours.toString().padStart(2, '0')}:
                      {timeUntilOpen.minutes.toString().padStart(2, '0')}:
                      {timeUntilOpen.seconds.toString().padStart(2, '0')}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setCurrentPage('products')}
                className="mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold text-lg rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
              >
                Ver Artículos
              </button>
              {userId && (
                <p className="mt-4 text-gray-600 text-sm">
                  ID de Usuario: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{userId}</span>
                </p>
              )}
            </div>
          );
        case 'products':
          const availableProducts: Product[] = products.filter((p: Product) => p.status === 'habilitado' && isSalesOpen());
          return (
            <div className="container mx-auto p-6 min-h-[calc(100vh-8rem)]">
              <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center rounded-lg p-2">
                Artículos Disponibles
              </h1>
              <button
                onClick={() => setCurrentPage('home')}
                className="mb-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200"
              >
                ← Volver a Inicio
              </button>
              {!salesStatus && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center mb-6 shadow-md">
                  <p className="font-semibold text-xl">¡Las ventas están cerradas ahora!</p>
                  <p>Por favor, regrese durante el horario de venta para ver y comprar artículos.</p>
                </div>
              )}
              {salesStatus && availableProducts.length === 0 && (
                <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg text-center shadow-md">
                  <p className="font-semibold text-xl mb-2">¡Ups! No hay artículos habilitados en este momento.</p>
                  <p>El administrador puede habilitar nuevos artículos pronto. ¡Mantente atento!</p>
                </div>
              )}
              {salesStatus && availableProducts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {availableProducts.map((product: Product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer"
                      onClick={() => {
                        setSelectedProduct(product);
                        setCurrentPage('product-detail');
                      }}
                    >
                      <div className="relative w-full h-60 bg-gray-100 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/400x300/F2F2F2/7F7F7F?text=${encodeURIComponent(product.name)}`; }}
                        />
                        <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                          ¡Único!
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
                        <p className="text-2xl font-bold text-indigo-700 mb-4">${product.price.toFixed(2)}</p>
                        <button
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation(); // Prevent navigating to detail page
                            handleBuyNow(product);
                          }}
                          className="mt-auto w-full px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                        >
                          Comprar Ahora
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        case 'product-detail':
          if (!selectedProduct) {
            setCurrentPage('products'); // Fallback if no product is selected
            return null;
          }
          return (
            <div className="container mx-auto p-6 min-h-[calc(100vh-8rem)]">
              <button
                onClick={() => setCurrentPage('products')}
                className="mb-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200"
              >
                ← Volver a Artículos
              </button>
              <div className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col gap-4">
                  <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden relative">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/800x600/F2F2F2/7F7F7F?text=${encodeURIComponent(selectedProduct.name)}`; }}
                    />
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                      ¡Artículo Único!
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProduct.galleryUrls.map((url: string, index: number) => (
                      <div key={index} className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`${selectedProduct.name} - Vista ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => {
                            // Simple swap for main image, or open a lightbox
                            setSelectedProduct(prev => (prev ? { ...prev, imageUrl: url } : null));
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/200x150/D9D9D9/4D4D4D?text=Vista+${index + 1}`; }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedProduct.name}</h1>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">{selectedProduct.description}</p>
                  <p className="text-5xl font-extrabold text-indigo-700 mb-8">${selectedProduct.price.toFixed(2)}</p>

                  {salesStatus && selectedProduct.status === 'habilitado' ? (
                    <button
                      onClick={() => handleBuyNow(selectedProduct)}
                      className="w-full px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
                    >
                      Comprar Ahora
                    </button>
                  ) : (
                    <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-semibold text-lg">
                      {salesStatus ? 'Este artículo ya no está disponible.' : 'Las ventas están cerradas ahora.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div className="font-sans antialiased bg-gray-50 text-gray-900">
      <header className="bg-white shadow-md p-4 sticky top-0 z-10">
        <nav className="container mx-auto flex justify-between items-center">
          <button onClick={() => { setCurrentPage('home'); setIsAdminView(false); }} className="text-2xl font-bold text-indigo-700 hover:text-indigo-800 transition duration-200">
            Tienda Unica
          </button>
          <div className="space-x-4 flex items-center">
            <button
              onClick={() => { setCurrentPage('home'); setIsAdminView(false); }}
              className="text-gray-700 hover:text-indigo-600 font-semibold transition duration-200"
            >
              Inicio
            </button>
            <button
              onClick={() => { setCurrentPage('products'); setIsAdminView(false); }}
              className="text-gray-700 hover:text-indigo-600 font-semibold transition duration-200"
            >
              Artículos
            </button>
            <button
              onClick={() => {
                setIsAdminView(!isAdminView);
                setCurrentPage(isAdminView ? 'home' : 'admin-panel'); // Switch to home if coming from admin, else admin panel
              }}
              className={`px-4 py-2 rounded-full font-semibold transition duration-200
                ${isAdminView ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {isAdminView ? 'Vista Cliente' : 'Vista Admin'}
            </button>
          </div>
        </nav>
      </header>

      <main className="pb-16">
        {renderPage()}
      </main>

      {/* Message Box */}
      {showMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Mensaje del Sistema</h3>
            <p className="text-gray-700 text-lg mb-6">{messageContent}</p>
            <button
              onClick={closeMessageBox}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300"
            >
              Cerrar
            </button>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeMessageBox}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white p-6 text-center">
        <p>&copy; 2025 Tienda Unica. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

// Define Props for CreateItemPage
interface CreateItemPageProps {
  onBack: () => void;
  onCreate: (newProductData: Omit<Product, 'id' | 'status'>) => void;
  showMessageBox: (message: string) => void; // Pass showMessageBox down
}

// New Component for Creating Items
const CreateItemPage: React.FC<CreateItemPageProps> = ({ onBack, onCreate, showMessageBox }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>(''); // Keep as string for input, convert on submit
  const [imageUrl, setImageUrl] = useState<string>('');
  const [galleryUrls, setGalleryUrls] = useState<string>(''); // Comma-separated string

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!name || !description || !price || !imageUrl) {
      showMessageBox('Por favor, complete todos los campos obligatorios (Nombre, Descripción, Precio, URL de Imagen Principal).');
      return;
    }

    const newProduct: Omit<Product, 'id' | 'status'> = {
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      galleryUrls: galleryUrls.split(',').map((url: string) => url.trim()).filter((url: string) => url !== ''),
    };
    onCreate(newProduct);
    // Clear form
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setGalleryUrls('');
  };

  return (
    <div className="container mx-auto p-6 min-h-[calc(100vh-8rem)]">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center rounded-lg p-2 bg-green-100">
        Crear Nuevo Artículo
      </h1>
      <button
        onClick={onBack}
        className="mb-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200"
      >
        ← Volver al Panel de Administración
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre del Artículo:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Descripción:
            </label>
            <textarea
              id="description"
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
              Precio:
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">
              URL de Imagen Principal:
            </label>
            <input
              type="url"
              id="imageUrl"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={imageUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="galleryUrls" className="block text-gray-700 text-sm font-bold mb-2">
              URLs de Galería (separadas por comas):
            </label>
            <input
              type="text"
              id="galleryUrls"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={galleryUrls}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGalleryUrls(e.target.value)}
              placeholder="Ej: url1.jpg, url2.png, url3.gif"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 transform hover:scale-105"
            >
              Guardar Artículo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
