import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-2xl font-bold">
                    <Link href="/">Online Pharmacy</Link>
                </div>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/" className="text-white hover:text-gray-200 transition duration-300">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/products" className="text-white hover:text-gray-200 transition duration-300">
                            Products
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;