# Influencer Management System

A full-stack application for managing influencers and their social media accounts.

## Features

- Create and manage influencers with their social media accounts
- Filter influencers by name and manager
- Assign/unassign managers to influencers
- Support for Instagram and TikTok accounts
- Prevent duplicate social media accounts

## Tech Stack

- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: MongoDB

## Project Structure

```
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── styles/
│   │   └── App.tsx
│   └── package.json
│
└── backend/           # Express backend application
    ├── models/
    ├── app.js
    ├── routes.js
    └── package.json
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Setup backend:
   ```bash
   cd backend
   cp .env.example .env    # Copy and configure environment variables
   npm install
   npm run seed           # Seed initial employee data
   npm start
   ```

3. Setup frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string and other variables as needed

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/your_database_name
PORT=5000
```

## API Endpoints

- `POST /api/influencers` - Create new influencer
- `GET /api/influencers` - List influencers (with optional filters)
- `PATCH /api/influencers/:id/manager` - Assign/unassign manager
- `GET /api/influencers/employees` - List all employees (managers)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
