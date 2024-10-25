# CosmicSyncCore

CosmicSyncCore is a flexible, P2P-based platform designed to enable decentralized data storage and synchronization for various applications. It supports a wide range of app types and use cases, including SharedSpheres and EPiC (Exercise Planning in Collaboration).

## Current Status

CosmicSyncCore is in early development. We have set up the basic project structure and implemented core components including P2P networking, database management, data synchronization, and encryption. We've also integrated an event bus system for improved inter-module communication and added Helia for decentralized file storage. Recently, we've implemented a comprehensive data synchronization system with conflict resolution and a complete test suite for core components.

## Recent Updates

- Implemented comprehensive test suite for core components
- Added data synchronization with last-write-wins conflict resolution
- Enhanced database operations with timestamp-based versioning
- Improved error handling and testing infrastructure

## Features

- Advanced P2P data synchronization with offline support using libp2p
- Flexible data model supporting various data types and structures
- Scalable user and data management across multiple applications
- Real-time updates and basic conflict resolution
- Secure, privacy-focused design with end-to-end encryption
- Extensible API for integration with various applications
- Support for custom data validation and business logic
- Cross-platform compatibility (Node.js based)
- Basic file upload and download functionality using Helia for decentralized storage

## Tech Stack

- Backend: Node.js
- Database: PostgreSQL
- P2P: libp2p
- Encryption: Node.js crypto module
- Decentralized Storage: Helia (IPFS implementation)

## Decentralized File Storage with Helia

CosmicSyncCore uses Helia, a modern, modular implementation of IPFS, for decentralized file storage. Helia offers several advantages:

- Improved performance and scalability for content retrieval and file management
- Better integration with decentralized web applications (PWAs)
- Support for content-addressed data via Content Identifiers (CIDs)
- Modular design allowing for customization and extension of core features
- Efficient "reference counting file system" for handling large datasets

While Helia is optimized for JavaScript and browser-based environments, it remains interoperable with the broader IPFS ecosystem, allowing for future scalability and integration options.

## Project Structure

```
CosmicSyncCore/
├── CHANGELOG.md
├── config
│   └── default.json
├── CONTRIBUTING.md
├── docs/
├── eslint.config.js
├── LICENSE.md
├── nodemon.js
├── package.json
├── package-lock.json
├── public
│   └── index.html
├── radata
├── README.md
├── scripts
└── src
    ├── api
    │   ├── restApi.js
    │   └── websocketApi.js
    ├── core
    │   ├── cryptoManager.js
    │   ├── errorHandler.js
    │   ├── eventBus.js
    │   ├── eventEmitter.js
    │   └── syncManager.js
    ├── data
    │   ├── dataAccessLayer.js
    │   ├── gunAdapter.js
    │   ├── heliaAdapter.js
    │   ├── kuboAdapter.js
    │   └── localStorageAdapter.js
    ├── index.js
    ├── networking
    ├── p2p
    │   ├── discovery.js
    │   ├── libp2pNode.js
    │   ├── natTraversal.js
    │   └── node.js
    └── plugins
        └── pluginManager.js
```

## Setup

1. Clone the repository
2. Install Node.js (version 14 or later recommended)
3. Install PostgreSQL and create a database for the project
4. Run `npm install` to install dependencies
5. Copy `.env.example` to `.env` and fill in the required environment variables
6. Run `npm start` to start the development server
7. Run `npm test -- --detectOpenHandles --forceExit` to run the test suite

## Contributing

We are not currently accepting external contributions as the project is in its initial development phase. Please check back later for contribution guidelines.

## License

This project is licensed under a custom license - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Claude 3.5 Sonnet for development assistance and brainstorming
- ChatGPT for name availability search and analysis
