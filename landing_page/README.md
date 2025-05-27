# Camp Pool Landing Page

This Next.js web application for the Camp Pool landing page.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- [PNPM](https://pnpm.io/installation) (version 8.x or later recommended)

## Getting Started

Follow these steps to get your development environment set up and running:

### 1. Clone the Repository

If you haven't already, clone the project repository to your local machine:
```bash
git clone <your-repository-url>
cd landing_page
```
Replace `<your-repository-url>` with the actual URL of the Git repository.

### 2. Install Dependencies

This project uses PNPM as its package manager. To install dependencies, run:

```bash
pnpm install
```

### 3. Set Up Environment Variables

This project requires environment variables for features like LinkedIn login and database connection.

1.  **Create `.env.local`**: In the `landing_page` root directory, create a file named `.env.local`.
2.  **Use Template**: Copy the contents of `exampledotenv` into `.env.local`.
3.  **Fill Values**: Update the placeholder values in `.env.local` with your actual credentials/keys.

    Essential variables include:
    *   `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` (LinkedIn App Client ID)
    *   `LINKEDIN_CLIENT_SECRET` (LinkedIn App Client Secret)
    *   `NEXT_PUBLIC_LINKEDIN_REDIRECT_URI` (Your LinkedIn App Redirect URI)
    *   `MONGODB_URI` (MongoDB connection string)
    *   `MONGODB_DB_NAME` (Database name for waitlist)
    *   `MONGODB_COLLECTION_NAME` (Collection name for waitlist emails)

    **Important:** The `exampledotenv` file serves as a template.

### 4. Run the Development Server

To start the development server, run:
```bash
pnpm dev
```
This command will start the development server, and you can view the application in your browser at `http://localhost:3000`.


