# Bluelingo Translation Buddy

A Node.js backend service using Microsoft Azure Cognitive Services to translate text between languages. It exposes REST endpoints for translation and language listing.

## Development Process

### Challenges Faced

- **Azure API Authentication:** Correctly using subscription keys and region headers for Azure Translator API requests.
- **Handling Multiple Target Languages:** Formatting query strings and parsing responses for multiple languages.
- **Error Handling:** Providing meaningful error messages for server-side and Azure API errors.
- **Environment Variables:** Managing sensitive credentials securely.

### Solutions Implemented

- Used `dotenv` for environment variable management.
- Supported both single and multiple target languages in `/translate`.
- Added robust error handling and logging.
- Used `cors` and `body-parser` for API usability.

### Lessons Learned

- Validate API responses and handle edge cases.
- Secure sensitive information and never commit `.env` files.
- Logging is crucial for debugging third-party API integrations.

## Running Locally

### Prerequisites

- Node.js (v14 or higher)
- Azure Translator subscription key and region

### Installation

1. Clone the repository.
2. Install dependencies:
    ```sh
    npm install
    ```
3. Copy `.env.example` to `.env` and fill in your Azure credentials:
    ```
    AZURE_SUBSCRIPTION_KEY=your_azure_subscription_key_here
    AZURE_REGION=your_azure_region_here
    AZURE_ENDPOINT=https://api.cognitive.microsofttranslator.com
    PORT=3000
    ```
4. Start the server:
    ```sh
    npm start
    ```

### API Endpoints

- `GET /languages`  
  Returns available languages supported by Azure Translator.

- `POST /translate`  
  Request body:
    ```json
    {
      "text": "Hello world",
      "to": ["es", "fr"], // or "es"
      "from": "en" // optional
    }
    ```
  Response:
    ```json
    {
      "translations": [
        { "text": "Hola mundo", "language": "es" },
        { "text": "Bonjour le monde", "language": "fr" }
      ]
    }
    ```

### Dependencies

- express
- body-parser
- cors
- dotenv
- node-fetch

## Maintenance Notes

- Update dependencies regularly.
- Keep `.env` out of version control.
- Extend endpoints in `server.js` for new features.
- Refer to Azure Translator API docs for changes.

## Attributions

- Microsoft. (n.d.). Translator Text API Documentation. Microsoft Azure Cognitive Services. https://learn.microsoft.com/en-us/azure/ai-services/translator/
- Express. (n.d.). Express - Node.js web application framework. https://expressjs.com/
- Dotenv. (n.d.). Dotenv - Loads environment variables from .env. https://github.com/motdotla/dotenv
- Node-fetch. (n.d.). node-fetch - A light-weight module that brings window.fetch to Node.js. https://github.com/node-fetch/node-fetch
- CORS. (n.d.). cors - Node.js CORS middleware. https://github.com/expressjs/cors
- Body-Parser. (n.d.). body-parser - Node.js body parsing middleware. https://github.com/expressjs/body-parser

---
