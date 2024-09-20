# CosmicSyncCore

CosmicSyncCore is a flexible, P2P-based platform designed to enable decentralized data storage and synchronization for various applications. It supports a wide range of app types and use cases, including SharedSpheres and EPiC (Exercise Planning in Collaboration).

## Current Status

CosmicSyncCore is in early development. We have set up the basic project structure and implemented core components including P2P networking, database management, data synchronization, and encryption. We've also integrated an event bus system for improved inter-module communication and added Helia for decentralized file storage.

## Features

- Advanced P2P data synchronization with offline support using libp2p
- Flexible data model supporting various data types and structures
- Scalable user and data management across multiple applications
- Real-time updates and basic conflict resolution
- Secure, privacy-focused design with end-to-end encryption
- Extensible API for integration with various applications
- Support for custom data validation and business logic
- Cross-platform compatibility (Node.js based)

## Tech Stack

- Backend: Node.js
- Database: PostgreSQL
- P2P: libp2p
- Encryption: Node.js crypto module

## Project Structure

```
CosmicSyncCore/
├── src/
│   ├── core/
│   │   ├── eventEmitter.js
│   │   ├── syncManager.js
│   │   └── cryptoManager.js
│   ├── p2p/
│   │   └── node.js
│   ├── db/
│   │   └── manager.js
│   ├── api/
│   │   └── apiManager.js
│   └── index.js
├── config/
│   └── default.json
├── tests/
├── docs/
└── scripts/
```

## Setup

1. Clone the repository
2. Install Node.js (version 14 or later recommended)
3. Install PostgreSQL and create a database for the project
4. Run `npm install` to install dependencies
5. Copy `.env.example` to `.env` and fill in the required environment variables
6. Run `npm start` to start the development server
7. Run `npm test` to run the test suite (to be implemented)

## Contributing

We are not currently accepting external contributions as the project is in its initial development phase. Please check back later for contribution guidelines.

## License

This project is licensed under a custom license - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Claude 3.5 Sonnet for development assistance and brainstorming
- ChatGPT for name availability search and analysis
