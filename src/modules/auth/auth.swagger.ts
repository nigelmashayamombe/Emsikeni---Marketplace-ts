import swaggerJSDoc, { Options } from 'swagger-jsdoc';

export const buildSwaggerSpec = () => {
  const options: Options = {
    definition: {
      openapi: '3.1.0',
      info: {
        title: 'Marketplace Auth API',
        version: '1.0.0',
        description:
          'Authentication, verification, and RBAC flows for the marketplace. All endpoints are versioned under /api/v1.',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          RegisterRequest: {
            type: 'object',
            required: ['email', 'phone', 'password', 'role'],
            properties: {
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              password: { type: 'string', minLength: 8 },
              role: {
                type: 'string',
                enum: ['SUPER_ADMIN', 'ADMIN', 'SELLER', 'BUYER', 'DRIVER'],
              },
              fullName: { type: 'string' },
              address: { type: 'string' },
              gender: { type: 'string' },
              dateOfBirth: { type: 'string', format: 'date' },
              nationalId: { type: 'string' },
              documents: {
                type: 'object',
                additionalProperties: { type: 'string', format: 'uri' },
              },
              driver: {
                type: 'object',
                properties: {
                  licenseNumber: { type: 'string' },
                  vehicleMake: { type: 'string' },
                  vehicleModel: { type: 'string' },
                  vehicleNumberPlate: { type: 'string' },
                },
              },
            },
          },
          VerifyEmailRequest: {
            type: 'object',
            required: ['token'],
            properties: {
              token: { type: 'string' },
            },
          },
          VerifyPhoneRequest: {
            type: 'object',
            required: ['phone', 'code'],
            properties: {
              phone: { type: 'string' },
              code: { type: 'string' },
            },
          },
          LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
            },
          },
          RefreshRequest: {
            type: 'object',
            required: ['refreshToken'],
            properties: {
              refreshToken: { type: 'string' },
            },
          },

          ApproveRequest: {
            type: 'object',
            required: ['userId'],
            properties: {
              userId: { type: 'string', format: 'uuid' },
            },
          },
          Tokens: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', default: false },
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
      paths: {
        '/api/v1/auth/register': {
          post: {
            tags: ['Public'],
            summary: 'Register buyer/seller/driver/admin (Admin registration requires SuperAdmin approval)',
            requestBody: {
              required: true,
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    required: ['email', 'phone', 'password', 'role', 'nationalId', 'proofOfResidence', 'profilePicture'],
                    properties: {
                      email: { type: 'string', format: 'email' },
                      phone: { type: 'string' },
                      password: { type: 'string', minLength: 8 },
                      role: {
                        type: 'string',
                        enum: ['SUPER_ADMIN', 'ADMIN', 'SELLER', 'BUYER', 'DRIVER'],
                      },
                      fullName: { type: 'string' },
                      address: { type: 'string' },
                      gender: { type: 'string' },
                      dateOfBirth: { type: 'string', format: 'date' },
                      // File fields
                      nationalId: { type: 'string', format: 'binary' },
                      proofOfResidence: { type: 'string', format: 'binary' },
                      profilePicture: { type: 'string', format: 'binary' },
                      driverLicense: { type: 'string', format: 'binary', description: 'Required if role is DRIVER' },
                      vehicleDocument: { type: 'string', format: 'binary', description: 'Required if role is DRIVER' },
                      // Driver details (as JSON string)
                      driver: {
                        type: 'string',
                        description: 'JSON string for driver details (licenseNumber, vehicleMake, vehicleModel, vehicleNumberPlate)',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                description: 'Registration accepted, verification sent',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: {
                          type: 'object',
                          properties: { userId: { type: 'string' } },
                        },
                      },
                    },
                  },
                },
              },
              409: { description: 'Duplicate email/phone', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
              400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/verify-email': {
          post: {
            tags: ['Public'],
            summary: 'Verify email via token',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyEmailRequest' } } },
            },
            responses: {
              200: { description: 'Email verified' },
              400: { description: 'Invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/verify-phone': {
          post: {
            tags: ['Public'],
            summary: 'Verify phone via OTP',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPhoneRequest' } } },
            },
            responses: {
              200: { description: 'Phone verified' },
              400: { description: 'Invalid OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/login': {
          post: {
            tags: ['Public'],
            summary: 'Login with email/password (only ACTIVE + verified)',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
            },
            responses: {
              200: {
                description: 'Tokens issued',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', default: true },
                        data: { $ref: '#/components/schemas/Tokens' },
                      },
                    },
                  },
                },
              },
              401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
              403: { description: 'Inactive/declined', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/refresh': {
          post: {
            tags: ['Public'],
            summary: 'Refresh tokens using refresh token',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } },
            },
            responses: {
              200: {
                description: 'Tokens rotated',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Tokens' } } },
              },
              401: { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },

        '/api/v1/auth/approve-admin': {
          post: {
            tags: ['Super Admin'],
            summary: 'Approve admin registration (SuperAdmin only)',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveRequest' } } },
            },
            responses: {
              200: { description: 'Admin approved' },
              404: { description: 'Admin not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/decline-admin': {
          post: {
            tags: ['Super Admin'],
            summary: 'Decline admin registration (SuperAdmin only)',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveRequest' } } },
            },
            responses: {
              200: { description: 'Admin declined' },
              404: { description: 'Admin not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/approve-seller': {
          post: {
            tags: ['Super Admin'],
            summary: 'Approve seller after document review',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveRequest' } } },
            },
            responses: {
              200: { description: 'Seller activated' },
              404: { description: 'Seller not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/decline-seller': {
          post: {
            tags: ['Super Admin'],
            summary: 'Decline seller after review',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveRequest' } } },
            },
            responses: {
              200: { description: 'Seller declined' },
              404: { description: 'Seller not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/approve-driver': {
          post: {
            tags: ['Super Admin'],
            summary: 'Approve driver after document review',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveRequest' } } },
            },
            responses: {
              200: { description: 'Driver activated' },
              404: { description: 'Driver not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
        '/api/v1/auth/decline-driver': {
          post: {
            tags: ['Super Admin'],
            summary: 'Decline driver after review',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveRequest' } } },
            },
            responses: {
              200: { description: 'Driver declined' },
              404: { description: 'Driver not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            },
          },
        },
      },
    },
    apis: [],
  };

  return swaggerJSDoc(options);
};

