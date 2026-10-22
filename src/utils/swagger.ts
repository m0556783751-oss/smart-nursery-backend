import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Smart Nursery API - המשתלה החכמה',
    description: 'Backend API for the Smart Nursery app. Browse plants, place orders, manage your personal garden with care reminders, and contact staff.',
    version: '1.0.0',
  },
  servers: [
    { url: '/api', description: 'API base path' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http' as const,
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from the login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'user@example.com' },
          name: { type: 'string', example: 'ישראל ישראלי' },
          role: { type: 'string', enum: ['CUSTOMER', 'STAFF'], example: 'CUSTOMER' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Plant: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'פוטוס זהוב' },
          description: { type: 'string', example: 'צמח פנימי קל לגידול' },
          categoryId: { type: 'integer', example: 1 },
          price: { type: 'number', example: 45.00 },
          imageUrl: { type: 'string', nullable: true },
          difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
          sunlight: { type: 'string', enum: ['FULL_SUN', 'PARTIAL_SHADE', 'SHADE'] },
          wateringFrequencyDays: { type: 'integer', example: 7 },
          season: { type: 'string', nullable: true, example: 'כל השנה' },
          inStock: { type: 'boolean', example: true },
          category: { $ref: '#/components/schemas/Category' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'פנימי' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer' },
          plantId: { type: 'integer' },
          status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'CANCELLED'] },
          createdAt: { type: 'string', format: 'date-time' },
          plant: { $ref: '#/components/schemas/Plant' },
          user: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' } } },
        },
      },
      UserPlant: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          plantId: { type: 'integer' },
          addedAt: { type: 'string', format: 'date-time' },
          plant: { $ref: '#/components/schemas/Plant' },
          careReminders: { type: 'array', items: { $ref: '#/components/schemas/CareReminder' } },
        },
      },
      CareReminder: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userPlantId: { type: 'integer' },
          type: { type: 'string', enum: ['WATERING', 'SUNLIGHT'] },
          message: { type: 'string', example: 'Time to water your plant!' },
          dueDate: { type: 'string', format: 'date' },
          isDone: { type: 'boolean' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          plantId: { type: 'integer', nullable: true },
          content: { type: 'string' },
          reply: { type: 'string', nullable: true },
          repliedBy: { type: 'integer', nullable: true },
          repliedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          user: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' } } },
          plant: { $ref: '#/components/schemas/Plant' },
          staff: { type: 'object', nullable: true, properties: { id: { type: 'integer' }, name: { type: 'string' } } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'newuser@example.com' },
                  password: { type: 'string', minLength: 6, example: 'mypassword123' },
                  name: { type: 'string', minLength: 2, example: 'דנה כהן' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, token: { type: 'string' } } } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Login with email and password. Returns a JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'user123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' } } } } },
          },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Returns the currently authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/plants': {
      get: {
        tags: ['Plants'],
        summary: 'List all plants',
        description: 'Browse the plant catalog. Supports search by name and filter by category/difficulty.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by plant name' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category name (e.g. פנימי, חיצוני)' },
          { name: 'difficulty', in: 'query', schema: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] }, description: 'Filter by difficulty' },
        ],
        responses: {
          '200': { description: 'List of plants', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Plant' } } } } },
        },
      },
      post: {
        tags: ['Plants'],
        summary: 'Create a new plant (Staff only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description', 'categoryId', 'price', 'difficulty', 'sunlight', 'wateringFrequencyDays'],
                properties: {
                  name: { type: 'string', example: 'צמח חדש' },
                  description: { type: 'string', example: 'תיאור הצמח' },
                  categoryId: { type: 'integer', example: 1 },
                  price: { type: 'number', example: 39.90 },
                  imageUrl: { type: 'string', nullable: true },
                  difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                  sunlight: { type: 'string', enum: ['FULL_SUN', 'PARTIAL_SHADE', 'SHADE'] },
                  wateringFrequencyDays: { type: 'integer', example: 5 },
                  season: { type: 'string', nullable: true },
                  inStock: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Plant created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Plant' } } } },
          '400': { description: 'Validation error' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (staff only)' },
        },
      },
    },
    '/plants/{id}': {
      get: {
        tags: ['Plants'],
        summary: 'Get plant details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Plant details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Plant' } } } },
          '404': { description: 'Plant not found' },
        },
      },
      put: {
        tags: ['Plants'],
        summary: 'Update a plant (Staff only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  categoryId: { type: 'integer' },
                  price: { type: 'number' },
                  imageUrl: { type: 'string', nullable: true },
                  difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                  sunlight: { type: 'string', enum: ['FULL_SUN', 'PARTIAL_SHADE', 'SHADE'] },
                  wateringFrequencyDays: { type: 'integer' },
                  season: { type: 'string', nullable: true },
                  inStock: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Plant updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Plant' } } } },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized' },
          '404': { description: 'Plant not found' },
        },
      },
      delete: {
        tags: ['Plants'],
        summary: 'Delete a plant (Staff only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Plant deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized' },
          '404': { description: 'Plant not found' },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List all categories',
        responses: {
          '200': { description: 'List of categories', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Place an order (Customer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['plantId'], properties: { plantId: { type: 'integer', example: 1 } } } } },
        },
        responses: {
          '201': { description: 'Order placed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '400': { description: 'Plant out of stock' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (customer only)' },
          '404': { description: 'Plant not found' },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        description: 'Customers see their own orders. Staff see all orders.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of orders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Order details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized' },
          '404': { description: 'Order not found' },
        },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status (Staff only)',
        description: 'Mark an order as COMPLETED or CANCELLED. When completed, the plant is added to the customer\'s garden with care reminders.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['COMPLETED', 'CANCELLED'] } } } } },
        },
        responses: {
          '200': { description: 'Order updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '400': { description: 'Order is not pending' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (staff only)' },
          '404': { description: 'Order not found' },
        },
      },
    },
    '/my-garden': {
      get: {
        tags: ['My Garden'],
        summary: 'Get my garden (Customer only)',
        description: 'Returns all plants the customer owns with their pending care reminders for today.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'My garden plants with reminders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/UserPlant' } } } } },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (customer only)' },
        },
      },
    },
    '/care-reminders': {
      get: {
        tags: ['Care Reminders'],
        summary: 'Get my reminders for today (Customer only)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Today\'s care reminders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CareReminder' } } } } },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized' },
        },
      },
    },
    '/care-reminders/{id}/done': {
      patch: {
        tags: ['Care Reminders'],
        summary: 'Mark reminder as done (Customer only)',
        description: 'Marks a care reminder as completed. Automatically creates the next reminder based on the plant\'s care schedule.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Reminder marked as done', content: { 'application/json': { schema: { $ref: '#/components/schemas/CareReminder' } } } },
          '400': { description: 'Already done' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized' },
          '404': { description: 'Reminder not found' },
        },
      },
    },
    '/messages': {
      post: {
        tags: ['Messages'],
        summary: 'Send a message to staff (Customer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'העלים של הצמח שלי מצהיבים, מה לעשות?' },
                  plantId: { type: 'integer', nullable: true, example: 1, description: 'Optional: which plant this is about' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Message sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (customer only)' },
        },
      },
      get: {
        tags: ['Messages'],
        summary: 'List messages',
        description: 'Customers see their own messages. Staff see all messages.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of messages', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Message' } } } } },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/messages/{id}': {
      get: {
        tags: ['Messages'],
        summary: 'Get message details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Message details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized' },
          '404': { description: 'Message not found' },
        },
      },
    },
    '/messages/{id}/reply': {
      patch: {
        tags: ['Messages'],
        summary: 'Reply to a message (Staff only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['reply'], properties: { reply: { type: 'string', example: 'נסי להפחית השקיה ולהעביר לאור עקיף' } } } } },
        },
        responses: {
          '200': { description: 'Reply sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '400': { description: 'Already replied' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Not authorized (staff only)' },
          '404': { description: 'Message not found' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': { description: 'Server is running', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, timestamp: { type: 'string', format: 'date-time' } } } } } },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, {
    customSiteTitle: 'Smart Nursery API Docs',
  }));
  app.get('/openapi.json', (_req, res) => {
    res.json(spec);
  });
}
