import swaggerJsdoc from 'swagger-jsdoc';

export const getApiDocs = () => {
  const spec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'VigiDoc API',
        version: '1.0.0',
        description: 'API documentation for VigiDoc Medical Application',
      },
      servers: [
        {
          url: '/',
          description: 'Current Origin',
        },
        {
          url: 'http://localhost:3000',
          description: 'Localhost',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./app/api/**/*.ts'], // Search for documentation in API routes
  });
  return spec;
};
