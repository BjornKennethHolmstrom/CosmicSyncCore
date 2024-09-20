# CosmicSyncCore

CosmicSyncCore is a flexible, P2P-based platform designed to enable decentralized data storage and synchronization for various applications. Initially developed to power the SharedSpheres ecosystem, it has evolved to support a wide range of app types and use cases, including SharedSpheres and EPiC (Exercise Planning in Collaboration).

## Features

- Advanced P2P data synchronization with offline support
- Flexible data model supporting various data types and structures
- Scalable user and data management across multiple applications
- Real-time updates and conflict resolution
- Secure, privacy-focused design with end-to-end encryption
- Extensible API for integration with various applications
- Support for custom data validation and business logic
- Cross-platform SDK support (Web, Mobile, Desktop)

## Supported Platforms

- SharedSpheres
- EPiC

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

