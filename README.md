# CosmicSyncCore

CosmicSyncCore is a flexible, P2P-based platform designed to enable decentralized data storage and synchronization for various applications. It supports a wide range of app types and use cases, including SharedSpheres and EPiC (Exercise Planning in Collaboration).

## Current Status

CosmicSyncCore is in early development (v0.3.6). Recent updates include improved database management, enhanced P2P networking capabilities, and better system migration support. We're currently focusing on completing Phase 1.0, which includes establishing a functional P2P network with basic communication.

Absolutely! Here's a snippet you can add to your README.md:

## 🤝 Get Involved & Contribute

**CosmicSyncCore is looking for rebels, builders, and visionaries** to help create the decentralized app platform of the future. We're building infrastructure for digital independence, and we need your help.

### 🚀 Quick Start for Contributors

- **New to the project?** Start with our **[Vision Document](docs/ESSENTIAL_READING/PROJECT_VISION.md)** to understand the big picture
- **Ready to contribute?** Check out the **[Quickstart Guide](docs/ESSENTIAL_READING/QUICKSTART_CONTRIBUTORS.md)** to find your first task
- **General guidelines** in our **[Contributing Guide](CONTRIBUTING.md)**

### 🎯 Immediate Priorities
We're currently focused on completing **Phase 1.0**:
- ✅ P2P networking with libp2p
- ✅ Decentralized storage with Helia/IPFS  
- 🔄 Real-time data synchronization
- 🔄 Basic conflict resolution
- 🔄 Core API completion

### 💡 Why Contribute?
- Build **truly disruptive** alternatives to big tech platforms
- Work with **cutting-edge P2P technologies** (libp2p, IPFS, Helia)
- Create **user-sovereign apps** that respect privacy by design
- Join a community building **infrastructure for digital freedom**

**Your code could help power the next generation of decentralized applications!**

## Recent Updates

- Enhanced database initialization and management
- Improved NAT traversal with STUN/TURN support
- Migration to Helia for decentralized storage
- Updated dependency management and security fixes

## Recent Updates

- Implemented advanced caching system with LRU eviction policy
- Added comprehensive backup and restore functionality
- Enhanced data access performance through intelligent caching
- Added backup integrity validation and automatic rotation

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
- Advanced caching system with LRU eviction and TTL support
- Comprehensive backup and restore functionality with compression
- Backup integrity validation and automatic rotation
- Event-based monitoring for cache and backup operations

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
├── combined.log
├── config
│   └── default.json
├── CONTRIBUTING.md
├── docs
│   ├── api
│   ├── decisions
│   ├── plan
│   └── project-review-roadmap.md
├── error.log
├── eslint.config.js
├── jest.config.js
├── jest.setup.js
├── jest.teardown.js
├── LICENSE.md
├── __mocks__
│   └── libp2p-gossipsub.mjs
├── nodemon.js
├── package.json
├── package-lock.json
├── public
│   ├── dashboard.html
│   └── index.html
├── radata
├── README.md
├── scripts
├── server
│   └── postgresAdapter.js
├── src
│   ├── api
│   │   ├── restApi.js
│   │   └── websocketApi.js
│   ├── config.js
│   ├── core
│   │   ├── auth.js
│   │   ├── backupManager.js
│   │   ├── cacheManager.js
│   │   ├── cryptoManager.js
│   │   ├── errorHandler.js
│   │   ├── errorMiddleware.js
│   │   ├── errors.js
│   │   ├── eventBus.js
│   │   ├── eventEmitter.js
│   │   ├── logger.js
│   │   ├── monitoring.js
│   │   └── syncManager.js
│   ├── data
│   │   ├── dataAccessLayer.js
│   │   ├── DatabaseManager.js
│   │   ├── gunAdapter.js
│   │   ├── heliaAdapter.js
│   │   ├── kuboAdapter.js
│   │   ├── localStorageAdapter.js
│   │   └── schema.js
│   ├── index.js
│   ├── middleware
│   │   └── rateLimiter.js
│   ├── networking
│   ├── p2p
│   │   ├── discovery.js
│   │   ├── libp2pNode.js
│   │   ├── natTraversal.js
│   │   └── node.js
│   ├── plugins
│   │   └── pluginManager.js
│   ├── testUtils
│   │   └── dbSetup.js
│   └── utils
│       └── validation.js
└── tests
    ├── helpers
    │   ├── dbSetup.helper.js
    │   └── testEnvironment.js
    └── integration
        ├── api-extended.test.js
        ├── api.test.js
        ├── auth-extended.test.js
        ├── auth.test.js
        ├── backup.test.js
        ├── cache.test.js
        ├── database.test.js
        ├── dataSync.test.js
        ├── data.test.js
        ├── p2p.test.js.bak
        ├── schema.test.js
        └── security.test.js


```

## Setup Instructions

### Prerequisites

- Node.js (v14.18.0 or later)
- PostgreSQL
- Build essentials (`build-essential`, `python3`, `gcc`, `g++`, `make`)
- SQLite development files (`libsqlite3-dev`)

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE cosmicsynccore;
CREATE USER cosmicsynccore WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cosmicsynccore TO cosmicsynccore;
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Initialize database:
```bash
npm run setup-db
# Or to reset database: npm run reset-db

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Development Tools

- Database Management: PostgreSQL
- P2P Networking: libp2p with enhanced NAT traversal
- Decentralized Storage: Helia (IPFS implementation)
- Testing: Jest
- API Documentation: OpenAPI/Swagger

### Testing
```bash
npm test -- --detectOpenHandles --forceExit
```
## License

This project is licensed under a custom license - see the [LICENSE.md](LICENSE.md) file for details.

## Next Steps

- Complete Phase 1.0 P2P networking implementation
- Enhance real-time data synchronization
- Improve security measures
- Expand test coverage
- Refine documentation

## Acknowledgments

- Claude 3.5 Sonnet for development assistance and brainstorming
- ChatGPT for name availability search and analysis
