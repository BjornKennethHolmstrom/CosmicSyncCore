// src/api/swagger.js
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to ensure the docs directory and yaml file exist
async function ensureSwaggerFile() {
  const docsDir = path.join(__dirname, '../../docs');
  const swaggerPath = path.join(docsDir, 'openapi.yaml');
  
  try {
    await fs.mkdir(docsDir, { recursive: true });
    
    // Check if file exists
    try {
      await fs.access(swaggerPath);
    } catch (error) {
      // File doesn't exist, create it with default content
      const defaultSwagger = `
openapi: 3.0.0
info:
  title: CosmicSyncCore API
  version: '1.0.0'
  description: |
    API documentation for CosmicSyncCore, a flexible P2P-based platform for decentralized data storage and synchronization.
  contact:
    name: Björn Kenneth Holmström
  license:
    name: Custom License
    url: https://github.com/BjornKennethHolmstrom/CosmicSyncCore/blob/main/LICENSE.md

servers:
  - url: http://localhost:3000/api/v1
    description: Development server

paths:
  /health:
    get:
      summary: Get API health status
      responses:
        '200':
          description: Health check response
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
`;
      await fs.writeFile(swaggerPath, defaultSwagger);
    }
  } catch (error) {
    console.error('Error ensuring swagger file exists:', error);
    throw error;
  }
}

export const validateApiSpec = (spec) => {
  if (!spec) {
    throw new Error('No OpenAPI specification provided');
  }
  
  const requiredFields = ['openapi', 'info', 'paths'];
  const missingFields = requiredFields.filter(field => !spec[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Invalid OpenAPI specification. Missing required fields: ${missingFields.join(', ')}`);
  }
  
  if (!spec.info.title || !spec.info.version) {
    throw new Error('Invalid info object. Missing required fields: title and/or version');
  }
};

export const setupSwagger = async (app) => {
  try {
    // Ensure swagger file exists
    await ensureSwaggerFile();
    
    // Load OpenAPI specification
    const swaggerPath = path.join(__dirname, '../../docs/openapi.yaml');
    const swaggerDocument = YAML.load(swaggerPath);
    
    // Validate the loaded specification
    validateApiSpec(swaggerDocument);
    
    // Add server URL dynamically based on environment
    const addServerUrl = (req) => {
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}/api/v1`;
      
      return {
        ...swaggerDocument,
        servers: [
          {
            url: baseUrl,
            description: `${process.env.NODE_ENV || 'development'} server`
          }
        ]
      };
    };

    // Serve Swagger documentation
    app.use('/api-docs', 
      (req, res, next) => {
        req.swaggerDoc = addServerUrl(req);
        next();
      },
      swaggerUi.serve, 
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: '/api-docs/swagger.json'
        }
      })
    );

    // Serve OpenAPI specification as JSON
    app.get('/api-docs/swagger.json', (req, res) => {
      res.json(addServerUrl(req));
    });
  } catch (error) {
    console.error('Error setting up Swagger:', error);
    throw error;
  }
};

export const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/openapi.yaml'));
