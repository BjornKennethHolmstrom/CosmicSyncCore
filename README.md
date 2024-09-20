# CosmicSyncCore

CosmicSyncCore is the core technology powering the SharedSpheres ecosystem, which includes the subcomponents MindSpheres, HeartSpheres, and BodySpheres. It's designed to efficiently connect individuals using advanced P2P synchronization and machine learning techniques.

## Features

- Advanced P2P data synchronization
- ML-powered intelligent profile matching
- Scalable user profile management across multiple spheres
- Secure and privacy-focused design
- API for integration with SharedSpheres platforms
- Ethical collaboration framework

## Supported Platforms

- SharedSpheres

## Tech Stack

- Backend: Python (Flask)
- Database: PostgreSQL with SQLAlchemy ORM
- P2P: libp2p
- Machine Learning: scikit-learn

## Setup

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Install PostgreSQL and create a database for the project
6. Set up environment variables for database connection in a `.env` file
7. Initialize the database: `alembic upgrade head`
8. Run tests: `python -m unittest discover tests`

## Database Configuration

This project uses PostgreSQL. Ensure you have PostgreSQL installed and running on your system. Create a database for the project and update the `.env` file with your database credentials.

Example `.env` file:
```
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cosmicsynccore
```

## License

This project is licensed under a custom license - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Claude 3.5 Sonnet for development assistance and brainstorming
- ChatGPT for name availability search and analysis

