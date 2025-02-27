
# Marvel Explorer

Marvel Explorer is a full-stack web application that allows users to explore the complex relationships between Marvel movies, actors, and characters. It helps users discover interesting connections in the Marvel Cinematic Universe, such as actors who have played multiple characters or characters portrayed by different actors across various films.

## 🌟 Features

-   **Movies Per Actor**: Explore which Marvel movies each actor has appeared in
-   **Actors with Multiple Characters**: Discover which actors have played different Marvel characters in various films
-   **Characters with Multiple Actors**: Find out which Marvel characters have been portrayed by different actors
-   **Admin Tools**: Manage the database with reload/refresh functionality
-   **Real-time Updates**: Track data loading progress through WebSocket connections
-   **Responsive Design**: Works seamlessly on both desktop and mobile devices

## 📐 Architecture

The application follows a modern full-stack architecture:

### Backend (NestJS)

The backend is built with NestJS, a progressive Node.js framework for building efficient and scalable server-side applications. It provides:

-   **RESTful API**: Clean and well-structured endpoint design
-   **Data Processing**: Fetches and normalizes Marvel movie data from TMDB
-   **Caching**: Implements efficient caching strategies to minimize API calls
-   **Database**: Stores processed data in MongoDB
-   **WebSockets**: Provides real-time progress updates during data operations

### Frontend (React)

The frontend is built with React, a JavaScript library for building user interfaces. It features:

-   **Material UI**: Sleek, responsive user interface with Marvel-themed styling
-   **Interactive Components**: Dynamic filters, searches, and visualizations
-   **State Management**: Context API for application state management
-   **WebSocket Integration**: Real-time updates for data loading progress
-   **Responsive Design**: Mobile-first approach ensuring compatibility across devices

### Database (MongoDB)

The application uses MongoDB to store:

-   Movies data (titles, release dates, poster images)
-   Actor information (names, profile images)
-   Character details (normalized names)
-   Relationships between movies, actors, and characters

## 🔄 Data Flow

1.  The application fetches raw data from TMDB API
2.  It processes and normalizes character names to handle variations
3.  The data is stored in MongoDB for efficient querying
4.  The frontend retrieves the processed data through RESTful API endpoints
5.  Users interact with the data through an intuitive UI

## 🚀 API Design

The API is designed with RESTful principles and provides the following endpoints:



### WebSocket Events


Real-time updates during data import operations

## 🔧 Technology Stack

### Backend

-   [NestJS](https://nestjs.com/) - Progressive Node.js framework
-   [MongoDB](https://www.mongodb.com/) - NoSQL database
-   [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
-   [Socket.io](https://socket.io/) - Real-time WebSocket communication
-   [Axios](https://axios-http.com/) - Promise-based HTTP client

### Frontend

-   [React](https://reactjs.org/) - JavaScript library for building user interfaces
-   [Material UI](https://mui.com/) - React UI component library
-   [React Router](https://reactrouter.com/) - Navigation and routing
-   [Recharts](https://recharts.org/) - Composable charting library
-   [Socket.io-client](https://socket.io/docs/v4/client-api/) - WebSocket client library

## 📋 Implementation Details

### Character Name Normalization

One of the key challenges addressed in this application is the normalization of character names. In the Marvel universe, characters are often referred to by multiple names (e.g., "Tony Stark" vs "Iron Man" vs "Tony Stark / Iron Man"). The application implements a sophisticated normalization algorithm that:

1.  Removes common noise patterns (parentheses, slashes, titles)
2.  Applies character-specific normalization rules
3.  Maintains a consistent representation for each character

This allows the application to correctly identify when the same character appears in different movies, even when their name is written differently.

### In-Memory Processing vs. Database Design

For this MVP implementation, I made a deliberate choice to use in-memory processing for character normalization rather than implementing a more complex database solution. This approach:

1.  Simplifies the initial implementation
2.  Provides flexibility during development
3.  Makes the code more transparent for evaluation
4.  Allows faster prototyping and iteration

In a production environment, this logic would be moved to database queries and aggregations for better performance and scalability.

### API Response Optimization

To optimize the frontend experience, the API responses include image URLs rather than just references, reducing the need for additional API calls to fetch images. This improves loading time and reduces the complexity of the frontend implementation.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   MongoDB (local or cloud instance)
-   TMDB API key

### Installation

1.  Clone the repository

    ```bash
    git clone https://github.com/yourusername/marvel-explorer.git
    cd marvel-explorer
    
    ```

2.  Create a `.env` file in the root directory with the following variables

    ```
    TMDB_API_KEY=your_tmdb_api_key
    MONGODB_URI=your_mongodb_connection_string
    
    ```

3.  Install dependencies

    ```bash
    npm run install:all
    
    ```

4.  Start the development servers

    ```bash
    npm run start:dev
    
    ```

5.  Open your browser and navigate to `http://localhost:3000`


### Docker Deployment

1.  Create a `.env` file in the root directory based on the `.env.example` file

    ```bash
    cp .env.example .env
    # Edit the .env file with your values
    
    ```

2.  Build and run the Docker containers

    ```bash
    # Build and start all services
    docker-compose up --build
    
    # Or run in the background (detached mode)
    docker-compose up -d
    
    # View logs if running in detached mode
    docker-compose logs -f
    
    ```

3.  Access the application at `http://localhost`

4.  To stop the containers

    ```bash
    docker-compose down
    
    ```

5.  To stop the containers and remove all data (including database)

    ```bash
    docker-compose down -v
    
    ```




## 📝 Development Notes

### Design Decisions

-   **Character Normalization**: Implemented in-memory for this MVP instead of database queries for simplicity and transparency
-   **RESTful API**: Designed around clear, descriptive endpoints for intuitive client-server interaction
-   **Pagination**: Implemented on all list endpoints to handle potentially large datasets
-   **Cache Management**: TMDB API responses are cached to minimize external API calls
-   **WebSocket Progress**: Added real-time progress tracking for long-running operations

### Future Improvements

-   **Advanced Search**: Implement more advanced search and filtering options
-   **User Accounts**: Add user authentication and saved favorites
-   **Performance Optimization**: Move character normalization logic to database aggregation pipelines
-   **Expanded Dataset**: Include more Marvel properties beyond the current movie set
-   **Timeline Visualization**: Add interactive timeline of Marvel releases
-   **Character Relationship Graph**: Visualize connections between characters

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

-   Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
-   This application is not endorsed or certified by TMDB
-   Built with love for Marvel fans everywhere
