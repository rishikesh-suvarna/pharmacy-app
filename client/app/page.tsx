import Link from 'next/link';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full">
        <h1 className="text-5xl font-bold text-center mb-6 text-blue-600">Online Pharmacy</h1>
        <p className="text-lg text-center mb-6 text-gray-700">
          Welcome to our online pharmacy. Browse and purchase medications online with ease and convenience.
        </p>
        <div className="flex justify-center">
            <Link href={"/products"} className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition duration-300">
              View Products
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;