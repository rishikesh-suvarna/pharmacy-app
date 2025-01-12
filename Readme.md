# Online Pharmacy App

This is an online pharmacy application that allows users to browse and purchase medications online. The backend is built using Go with the Gin framework and GORM for database interactions. The frontend is developed using Next.js.

## Features

- User authentication and authorization
- Browse and search for medications
- Add medications to the cart
- Place orders and track order status
- Admin panel for managing medications and orders

## Technologies Used

### Backend

- Go
- Gin
- GORM
- PostgreSQL (or any other preferred database)

### Frontend

- Next.js
- React
- Tailwind CSS (or any other preferred CSS framework)

## Getting Started

### Prerequisites

- Go (version 1.16 or higher)
- Node.js (version 14 or higher)
- PostgreSQL (or any other preferred database)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/rishikesh-suvarna/pharmacy-app.git
    cd pharmacy-app
    ```

2. Set up the backend:

    ```bash
    cd server
    go mod download
    ```

3. Set up the frontend:

    ```bash
    cd ../client
    npm install
    ```

4. Configure the database and environment variables for both backend and frontend.

### Running the Application

1. Start the backend server:

    ```bash
    cd server
    go run main.go
    ```

2. Start the frontend development server:

    ```bash
    cd client
    npm run dev
    ```

3. Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or inquiries, please contact [rishikeshsuvarna@gmail.com](mailto:rishikeshsuvarna@gmail.com).
