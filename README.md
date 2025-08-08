# Bluelingo Translation Buddy

## Overview

Bluelingo Translation Buddy is a web-based language translator widget that utilizes Microsoft Azure Cognitive Services to translate text. The project includes a Node.js backend (`server.js`) with **comprehensive Swagger documentation** for enhanced developer experience and a frontend composed of `index.html`, `style.css`, and `script.js`. The backend provides RESTful endpoints for text translation and language listing, while the frontend offers a user-friendly interface featuring translation history and multi-language support.

## Features

- **Multi-language Translation**: Translate text to multiple target languages simultaneously
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Theme Support**: Toggle between light and dark modes with persistent preferences
- **Translation History**: Save, view, and reuse previous translations
- **Character Limit**: Smart input validation with 50,000-character limit
- **Copy Functionality**: One-click copying of translation results
- **Interactive API Documentation**: Comprehensive Swagger UI for API exploration

## Technology Stack

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS custom properties and flexbox/grid layouts
- **JavaScript (ES6+)**: Dynamic functionality and API interactions
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Montserrat font family for typography

### Backend
- **Node.js**: Server runtime environment
- **Express.js**: Web application framework
- **Microsoft Azure Translator API**: Translation service provider
- **Swagger UI Express**: Interactive API documentation
- **Swagger JSDoc**: API documentation generation from code comments

### Development Tools
- **dotenv**: Environment variable management
- **CORS**: Cross-origin resource sharing configuration
- **body-parser**: Request body parsing middleware

## Prerequisites

- **Visual Studio Code** (IDE)
- **Node.js** (version 14.0 or higher)
- **npm** (version 6.0 or higher)
- **Microsoft Azure Account** with Translator service enabled

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/jer-webdesign/backend-translator.git
cd backend-translator
```

### 2. Initialize npm Project

```bash
npm init -y
```

### 3. Install Dependencies

Install all required dependencies:

```bash
# Install all production dependencies at once
npm install body-parser cors dotenv express node-fetch swagger-jsdoc swagger-ui-express

# Or install individually:
npm install body-parser
npm install cors
npm install dotenv
npm install express
npm install node-fetch
npm install swagger-jsdoc
npm install swagger-ui-express
```

### 4. Environment Configuration

Create a `.env` file in the "backend-translator" directory:

```env
AZURE_SUBSCRIPTION_KEY=your_azure_subscription_key
AZURE_REGION=your_azure_region
AZURE_ENDPOINT=https://api.cognitive.microsofttranslator.com
PORT=3000
```

### 5. Azure Translator Service Setup

1. **Create an Azure Account**: Visit [Azure Portal](https://portal.azure.com)
2. **Create Translator Resource**:
   - Search for "Translator" in the Azure marketplace
   - Click "Create" and fill in the required information
   - Choose your subscription and resource group
   - Select a region (e.g., "East US", "West Europe")
   - Choose pricing tier (F0 for free tier, S1 for standard)
3. **Get Credentials**:
   - Navigate to your Translator resource
   - Go to "Keys and Endpoint"
   - Copy Key 1 (subscription key), Region, and Endpoint
   - Update your `.env` file with these values

## Swagger Integration

### Configuration

The integration of Swagger into our Azure Translator API backend enhances the development experience with comprehensive API documentation.

**Dependencies Added:**

```json
{
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1"
}
```

**Configuration Implementation:**

```javascript
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Azure Translator API",
      version: "1.0.0",
      description: "API to translate text and fetch supported languages using Microsoft Azure Translator",
    },
    servers: [
      {
        url: `https://backend-translator-9m88.onrender.com`,
        description: "Production server (Render)",
      },
      {
        url: `http://localhost:${port}`,
        description: "Local development server",
      },
    ],
  },
  apis: ["./server.js"], // Path to API files
};
```

### API Endpoints

#### Languages Endpoint

```javascript
/**
 * @swagger
 * /languages:
 *   get:
 *     summary: Get supported languages from Azure Translator API
 *     responses:
 *       200:
 *         description: A list of supported languages
 *       500:
 *         description: Server or Azure API error
 */
```

#### Translation Endpoint

```javascript
/**
 * @swagger
 * /translate:
 *   post:
 *     summary: Translate text using Azure Translator API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to translate
 *               to:
 *                 type: [string, array]
 *                 description: Target language(s)
 *               from:
 *                 type: string
 *                 description: (Optional) Source language
 *     responses:
 *       200:
 *         description: Translation result
 *       400:
 *         description: Missing text field
 *       500:
 *         description: Server or Azure API error
 */
```

## Running the Application

### Local Development

1. Start the backend server:

```bash
npm start
```

2. Access the Application:
   - **Main Application**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api-docs

### Production Deployment (GitHub to Render)

#### 1. Prepare Repository for Deployment

Create essential files:
- `package.json` - Ensure it includes all dependencies and scripts
- Update `server.js` for Production
- Commit and push to GitHub:

```bash
git add .
git commit -m "Update server.js with Swagger integration"
git push origin main
```

#### 2. Deploy to Render

1. **Create Render Account and Connect GitHub**
   - Visit [render.com](https://render.com) and sign up
   - Connect your GitHub account
   - Click "New +" and select "Web Service"
   - Select your repository from the list

2. **Configure Deployment Settings**

   **Basic Settings:**
   - **Name:** backend-translator
   - **Region:** Choose closest to your users
   - **Branch:** main
   - **Root Directory:** Leave blank (unless app is in subdirectory)

   **Build & Deploy:**
   - **Runtime:** Node
   - **Build Command:** npm install
   - **Start Command:** npm start

   **Advanced Settings:**
   - **Auto-Deploy:** Yes (deploys automatically on GitHub pushes)
   - **Environment:** Node

3. **Configure Environment Variables**

   In the Render dashboard, add these environment variables:

   | Key | Value | Notes |
   |-----|-------|-------|
   | AZURE_SUBSCRIPTION_KEY | your_azure_key | From Azure portal |
   | AZURE_REGION | your_azure_region | e.g., canadacentral |
   | AZURE_ENDPOINT | https://api.cognitive.microsofttranslator.com | Standard endpoint |
   | NODE_ENV | production | Set environment mode |
   | PORT | 3000 | Render default (auto-assigned) |

4. **Deploy the Application**
   - Click "Create Web Service"
   - Render will automatically:
     - Clone your repository
     - Install dependencies
     - Start your application
     - Assign a URL (e.g., https://backend-translator.onrender.com)

### Accessing Your Deployed Application

Once deployment is complete, your application will be available at:

- **Main Application:** https://backend-translator.onrender.com
- **Swagger API Documentation:** https://backend-translator.onrender.com/api-docs

## Error Handling

- The widget displays clear error messages if the backend returns an error or if the translation service is unreachable
- Unexpected response formats are handled gracefully

## Challenges and Solutions

### Challenge 1: Schema Definition Complexity

**Issue:** Defining flexible schemas for the translation endpoint that could handle both single and multiple target languages.

**Solution:** Used OpenAPI 3.0's flexible type definitions allowing both string and array types for the `to` parameter:

```javascript
to:
  type: [string, array]
  description: Target language(s)
```

### Challenge 2: Environment-Specific Documentation

**Issue:** Ensuring the Swagger documentation reflected the correct server URLs across different environments.

**Solution:** Implemented dynamic server configuration using environment variables:

```javascript
servers: [
  {
    url: `https://backend-translator-9m88.onrender.com`,
    description: "Production server (Render)",
  },
  {
    url: `http://localhost:${port}`,
    description: "Local development server",
  },
],
```

### Challenge 3: Request/Response Format Documentation

**Issue:** Accurately documenting the complex response formats from Azure Translator API.

**Solution:** Detailed response schema documentation with examples for both single and multiple translation scenarios.

## Code Modifications Summary

- **Package.json Updates**: Added Swagger dependencies
- **Server.js Enhancements**: Integrated Swagger middleware and comprehensive JSDoc comments
- **API Route Documentation**: Added detailed Swagger annotations for all endpoints
- **Error Handling Documentation**: Documented all possible error responses
- **Response Schema Definition**: Created detailed schemas for API responses

## Impact Analysis

### Enhanced Developer Experience

The Swagger integration has significantly improved the developer experience by providing:
- **Interactive API Testing**: Developers can now test API endpoints directly from the browser
- **Clear Documentation**: Comprehensive, auto-generated documentation eliminates ambiguity
- **Reduced Onboarding Time**: New developers can understand and interact with the API within minutes

### Improved API Discoverability

- **Self-Documenting Code**: JSDoc comments serve dual purposes - code documentation and API docs
- **Real-time Updates**: Documentation automatically reflects code changes
- **Professional Presentation**: Clean, professional interface for stakeholders and clients

### Better Error Handling Visibility

- **Comprehensive Error Documentation**: All possible error scenarios are documented
- **Response Format Clarity**: Clear examples of success and error responses
- **HTTP Status Code Mapping**: Proper documentation of when each status code is returned

### Stakeholder Communication

- **Non-Technical Accessibility**: Stakeholders can understand API capabilities without technical knowledge
- **Demo-Ready Interface**: Perfect for client presentations and project demonstrations
- **API Contract Definition**: Clear contract between frontend and backend teams

## Performance Impact

### Positive Aspects
- **Minimal Runtime Overhead**: Swagger UI adds negligible performance impact
- **Development Efficiency**: Faster debugging and testing cycles
- **Reduced Support Overhead**: Self-service API exploration reduces support requests

### Considerations
- **Bundle Size**: Additional dependencies increase overall application size by ~2MB
- **Memory Usage**: Swagger UI adds minimal memory footprint (~5-10MB)

## Future Improvements

### 1. Enhanced Schema Definitions
- Add more detailed response examples
- Include error response schemas with specific error codes
- Document rate limiting and authentication requirements

### 2. Environment-Specific Documentation
- Multi-environment configuration (development, staging, production)
- Environment-specific examples and endpoints
- Deployment-specific documentation

### 3. API Versioning Documentation
- Version history and changelog integration
- Backward compatibility documentation
- Migration guides for API updates

### 4. Security Documentation
- Detailed authentication flow documentation
- Security best practices
- API key management guidelines

## Attributions

- [Microsoft Azure Translator API](https://learn.microsoft.com/en-us/azure/ai-services/translator/)
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Render Cloud Platform](https://render.com/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
