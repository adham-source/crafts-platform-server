import { Express } from 'express';
import path from 'path';
import { config } from './config';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const swaggerSpecification = {
  openapi: '3.0.0',
  info: {
    title: 'Crafts Platform API',
    version: '0.1.0',
    description:
      'Crafts Platform backend API for user registration, login, email verification, and admin user management.\n\n' +
      '### 🌍 Multi-language Support:\n' +
      'You can switch languages using the **Accept-Language** parameter in each request below.\n\n' +
      '### 🛡️ Security & Reliability:\n' +
      '- **JWT Authentication**: Click "Authorize" and enter your Bearer token.\n' +
      '- **Health Monitoring**: Check `/health` for system status.\n\n' +
      'This documentation is optimized for both development and production.',
    termsOfService: 'https://crafts-platform.local/terms',
    contact: {
      name: 'Crafts Platform Support',
      email: 'support@crafts-platform.local'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: config.urls.server,
      description: 'Dynamic Server (Production or Local)'
    }
  ],
  // إضافة معامل اللغة بشكل عالمي لكل المسارات
  components: {
    parameters: {
      LanguageHeader: {
        name: 'Accept-Language',
        in: 'header',
        description: 'Set language: "ar" for Arabic, "en" for English',
        required: false,
        schema: {
          type: 'string',
          enum: ['ar', 'en'],
          default: 'ar'
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { 
            type: 'string', 
            description: 'A human-readable error message, usually translated.' 
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Sami Al-Harbi' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { 
            type: 'string', 
            format: 'password', 
            example: 'StrongP@ssw0rd',
            description: 'Security requirements: 8+ chars, uppercase, lowercase, number, special char.'
          },
          role: { 
            type: 'string', 
            enum: ['artisan', 'buyer'],
            description: 'The user role. Defaults to buyer.', 
            example: 'artisan' 
          },
          craftSpecialty: {
            type: 'array',
            description: 'Optional list of craft categories for artisans.',
            items: { type: 'string' },
            example: ['pottery', 'woodwork']
          },
          bio: {
            type: 'object',
            description: 'Optional biographical information in supported languages.',
            properties: {
              ar: { type: 'string', maxLength: 500, example: 'حرفي متخصص في الخزف' },
              en: { type: 'string', maxLength: 500, example: 'Craftsman specializing in pottery' }
            }
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', format: 'password', example: 'StrongP@ssw0rd' }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', description: 'The valid refresh token obtained from login.', example: 'eyJhbGciOiJIUzI1...' }
        }
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string', description: 'The verification token sent to email.', example: 'v-token-123' },
          password: { 
            type: 'string', 
            format: 'password', 
            example: 'NewStrongP@ssw0rd',
            description: 'New password meeting complexity requirements.'
          }
        }
      },
      LogoutRequest: {
        type: 'object',
        properties: {
          refreshToken: { 
            type: 'string', 
            description: 'The refresh token to revoke for current device logout.', 
            example: 'eyJhbGciOiJIUzI1...' 
          },
          allDevices: { 
            type: 'boolean', 
            description: 'Set to true to logout from all devices and revoke all tokens.', 
            example: false 
          }
        }
      },
      RoleUpdateRequest: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { 
            type: 'string', 
            enum: ['artisan', 'buyer'],
            description: 'The new role to assign to the user.', 
            example: 'buyer' 
          }
        }
      },
      ToggleBlockRequest: {
        type: 'object',
        required: ['isBlocked'],
        properties: {
          isBlocked: { type: 'boolean', description: 'True to block user, false to unblock.' }
        }
      },
      RevokeRefreshRequest: {
        type: 'object',
        properties: {
          jti: { type: 'string', description: 'Specific token ID to revoke. If omitted, all user sessions are ended.', example: 'jti-uuid' }
        }
      },
      NewsletterRequest: {
        type: 'object',
        required: ['subject', 'message'],
        properties: {
          subject: { type: 'string', minLength: 5, maxLength: 120, example: 'New Updates!' },
          message: { type: 'string', minLength: 10, maxLength: 5000, example: 'Content of the newsletter...' }
        }
      },
      UserSummary: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'isEmailVerified', 'isBlocked'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', description: 'Assigned user role.' },
          isEmailVerified: { type: 'boolean' },
          isBlocked: { type: 'boolean' }
        }
      },
      AuthPayload: {
        type: 'object',
        required: ['accessToken', 'refreshToken', 'user'],
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/components/schemas/UserSummary' }
        }
      },
      RegistrationSuccess: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Registration successful' },
          data: { $ref: '#/components/schemas/UserSummary' }
        }
      },
      AccessTokenResponse: {
        type: 'object',
        required: ['accessToken'],
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' }
        }
      },
      SuccessResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' }
        }
      },
      UserListResponse: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserSummary' }
          }
        }
      }
    }
  }
};

const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    defaultModelsExpandDepth: 1,
    defaultModelRendering: 'example',
    displayRequestDuration: true,
    persistAuthorization: true,
    tryItOutEnabled: true,
    operationsSorter: 'alpha',
    supportedSubmitMethods: ['get', 'post', 'patch']
  }
};

export function setupSwagger(app: Express) {
  const controllersGlob = path.join(__dirname, 'controllers', '*.ts');
  const spec = swaggerJSDoc({ definition: swaggerSpecification, apis: [controllersGlob] });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, swaggerUiOptions));
}
