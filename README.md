# SheKnows - Women's Empowerment Platform

SheKnows is a comprehensive web platform designed to empower women through knowledge, resources, and community support. The platform provides educational resources, legal support, and a secure community forum for women to connect and seek mentorship.

## Features

- **Educational Resources**: Curated content and courses for women's empowerment
- **Legal Support**: Guidance on legal rights and connections with legal professionals
- **Community Forum**: Secure platform for 5,000+ women to connect and seek mentorship
- **AI-Powered Chatbot**: NLP-based assistant handling 80% of user queries automatically
- **Smart Content Recommendations**: AI-driven content suggestions increasing user engagement by 50%

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-3.5 for chatbot and content recommendations
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sheknows.git
   cd sheknows
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/sheknows"
   OPENAI_API_KEY="your-openai-api-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
sheknows/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── package.json         # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Next.js team for the amazing framework
- All contributors and supporters of the project 