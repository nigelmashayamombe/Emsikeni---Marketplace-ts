import swaggerJSDoc, { Options } from 'swagger-jsdoc';

export const buildSwaggerSpec = () => {
    const options: Options = {
        definition: {
            openapi: '3.1.0',
            info: {
                title: 'Marketplace API',
                version: '1.0.0',
                description:
                    'API documentation for the Marketplace application. All endpoints are versioned under /api/v1.',
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
                    // --- Auth Schemas ---
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

                    // --- Category Schemas ---
                    Category: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            slug: { type: 'string' },
                            parentId: { type: 'string', format: 'uuid', nullable: true },
                            children: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Category' }
                            },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    },

                    // --- Product Schemas ---
                    Product: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            price: { type: 'number', format: 'float' },
                            quantity: { type: 'integer' },
                            images: { type: 'array', items: { type: 'string', format: 'uri' } },
                            status: { $ref: '#/components/schemas/ProductStatus' },
                            rejectionReason: { type: 'string', nullable: true },
                            sellerId: { type: 'string', format: 'uuid' },
                            categoryId: { type: 'string', format: 'uuid' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    },
                    ProductStatus: {
                        type: 'string',
                        enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'OUT_OF_STOCK']
                    },
                    CreateProductRequest: {
                        type: 'object',
                        required: ['name', 'description', 'price', 'quantity', 'categoryId'],
                        properties: {
                            name: { type: 'string', minLength: 3 },
                            description: { type: 'string', minLength: 10 },
                            price: { type: 'number', minimum: 0 },
                            quantity: { type: 'integer', minimum: 0 },
                            categoryId: { type: 'string', format: 'uuid' },
                            status: { $ref: '#/components/schemas/ProductStatus' },
                            images: {
                                type: 'array',
                                items: { type: 'string', format: 'binary' },
                                description: 'Images to upload (max 5)'
                            }
                        }
                    },
                    UpdateProductRequest: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', minLength: 3 },
                            description: { type: 'string', minLength: 10 },
                            price: { type: 'number', minimum: 0 },
                            quantity: { type: 'integer', minimum: 0 },
                            categoryId: { type: 'string', format: 'uuid' },
                            status: { $ref: '#/components/schemas/ProductStatus' },
                            images: {
                                type: 'array',
                                items: { type: 'string', format: 'binary' },
                                description: 'Additional images to upload'
                            }
                        }
                    },
                    ReviewProductRequest: {
                        type: 'object',
                        required: ['status'],
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['APPROVED', 'REJECTED']
                            },
                            rejectionReason: { type: 'string' }
                        }
                    },

                    // --- Shared Schemas ---
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
                // --- Auth Paths ---
                '/api/v1/auth/register': {
                    post: {
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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
                        tags: ['Auth'],
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

                // --- Product Paths ---
                '/api/v1/products': {
                    get: {
                        tags: ['Products'],
                        summary: 'List public approved products',
                        parameters: [
                            { in: 'query', name: 'categoryId', schema: { type: 'string', format: 'uuid' } },
                            { in: 'query', name: 'sellerId', schema: { type: 'string', format: 'uuid' } }
                        ],
                        responses: {
                            200: {
                                description: 'List of products',
                                content: {
                                    'application/json': {
                                        schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        tags: ['Products'],
                        summary: 'Create a product (Seller only)',
                        security: [{ bearerAuth: [] }],
                        requestBody: {
                            required: true,
                            content: {
                                'multipart/form-data': {
                                    schema: { $ref: '#/components/schemas/CreateProductRequest' }
                                }
                            }
                        },
                        responses: {
                            201: { description: 'Product created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
                            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                        }
                    }
                },
                '/api/v1/products/{id}': {
                    get: {
                        tags: ['Products'],
                        summary: 'Get public product by ID',
                        parameters: [
                            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
                        ],
                        responses: {
                            200: { description: 'Product details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
                            404: { description: 'not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                        }
                    },
                    put: {
                        tags: ['Products'],
                        summary: 'Update product (Seller only)',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                'multipart/form-data': {
                                    schema: { $ref: '#/components/schemas/UpdateProductRequest' }
                                }
                            }
                        },
                        responses: {
                            200: { description: 'Product updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
                            404: { description: 'not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                        }
                    },
                    delete: {
                        tags: ['Products'],
                        summary: 'Soft delete product (Seller only)',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
                        ],
                        responses: {
                            204: { description: 'Product deleted' },
                            404: { description: 'not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                        }
                    }
                },
                '/api/v1/products/my': {
                    get: {
                        tags: ['Products'],
                        summary: 'List my products (Seller only)',
                        security: [{ bearerAuth: [] }],
                        responses: {
                            200: {
                                description: 'List of own products',
                                content: {
                                    'application/json': {
                                        schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                                    }
                                }
                            }
                        }
                    }
                },
                '/api/v1/products/my/{id}': {
                    get: {
                        tags: ['Products'],
                        summary: 'Get my product endpoint (Seller only)',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
                        ],
                        responses: {
                            200: { description: 'Product details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
                            404: { description: 'not found' }
                        }
                    }
                },
                '/api/v1/products/{id}/review': {
                    patch: {
                        tags: ['Products'],
                        summary: 'Review product (Admin only)',
                        security: [{ bearerAuth: [] }],
                        parameters: [
                            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
                        ],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ReviewProductRequest' }
                                }
                            }
                        },
                        responses: {
                            200: { description: 'Product reviewed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }
                        }
                    }
                }
            },
        },
        // Search for JSDoc in all controller files
        apis: ['./src/modules/**/*.controller.ts', './src/modules/**/*.routes.ts'],
    };

    return swaggerJSDoc(options);
};
