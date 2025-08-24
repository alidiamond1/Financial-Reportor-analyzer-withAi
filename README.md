# Financial Report Analyzer SaaS

A comprehensive AI-powered financial report analysis platform built with Next.js, Supabase, and Google Gemini AI.

## 🚀 Features

### Core Functionality
- **AI-Powered Analysis**: Automated financial report analysis using Google Gemini AI
- **Multi-Format Support**: Upload PDF, Excel, and CSV files
- **Real-time Dashboard**: Interactive visualizations and KPI tracking
- **Smart Chat**: Ask questions about your financial data with AI assistance
- **Export Capabilities**: Export reports to PDF, Word, and Notion

### User Management
- **Authentication**: Secure user registration and login with Supabase Auth
- **Role-Based Access**: User and admin roles with different permissions
- **Subscription Tiers**: Free, Pro, and Enterprise plans with feature restrictions

### Analytics & Insights
- **KPI Extraction**: Automatic extraction of key financial metrics
- **Risk Assessment**: AI-identified potential risks and concerns
- **Opportunity Analysis**: Growth opportunities and recommendations
- **Visual Dashboards**: Charts and graphs for data visualization

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **React Context**: State management

### Backend & Database
- **Supabase**: Backend-as-a-Service (Database, Auth, Storage)
- **PostgreSQL**: Primary database
- **Row Level Security**: Data security and access control

### AI & Processing
- **Google Gemini AI**: Natural language processing and analysis
- **File Processing**: PDF, Excel, and CSV parsing capabilities

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js 18+** installed
2. **npm** or **yarn** package manager
3. **Supabase Account** - [Sign up here](https://supabase.com)
4. **Google AI Studio Account** - [Get API key here](https://makersuite.google.com/app/apikey)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd financial-report-analyzer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Set Up Supabase Database

1. Create a new Supabase project
2. Run the SQL script in `src/lib/database-schema.sql` in your Supabase SQL editor
3. Set up storage buckets for file uploads
4. Configure authentication settings

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── files/         # File management
│   │   ├── analysis/      # AI analysis endpoints
│   │   ├── dashboard/     # Dashboard & export
│   │   └── chat/          # Chat functionality
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
│   ├── supabase.ts      # Supabase client
│   ├── gemini.ts        # AI service
│   ├── auth.ts          # Auth utilities
│   ├── file-parser.ts   # File processing
│   └── dashboard.ts     # Dashboard generation
└── types/               # TypeScript type definitions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### File Management
- `POST /api/files` - Upload file
- `GET /api/files` - Get user files
- `GET /api/files/[id]` - Get specific file
- `DELETE /api/files/[id]` - Delete file

### Analysis
- `GET /api/analysis` - Get user analyses
- `POST /api/analysis/generate` - Generate new analysis
- `GET /api/analysis/[id]` - Get specific analysis

### Dashboard
- `GET /api/dashboard/[analysisId]` - Get dashboard data
- `POST /api/dashboard/export` - Export dashboard

### Chat
- `POST /api/chat/query` - Send chat query
- `GET /api/chat/query` - Get chat history

## 🎯 Usage

### 1. User Registration
1. Navigate to the landing page
2. Click "Get Started" or "Sign Up"
3. Fill in registration form
4. Verify email address

### 2. Upload Financial Reports
1. Login to your dashboard
2. Click "Upload File" or drag & drop
3. Select PDF, Excel, or CSV file
4. Wait for upload confirmation

### 3. Generate Analysis
1. View uploaded files in dashboard
2. Click "Analyze" on a file
3. Wait for AI processing (30-60 seconds)
4. Review generated insights

### 4. Explore Dashboard
1. View KPIs and metrics
2. Analyze charts and visualizations
3. Review risks and opportunities
4. Read AI recommendations

### 5. Use Chat Feature (Pro+)
1. Open chat interface
2. Ask questions about your data
3. Get AI-powered responses
4. Reference specific analyses

### 6. Export Reports
1. Navigate to analysis dashboard
2. Click "Export" button
3. Choose format (PDF/Word/Notion)
4. Download generated report

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **File Validation**: Type and size restrictions
- **Rate Limiting**: API request throttling
- **HTTPS Only**: Secure data transmission

## 📊 Subscription Tiers

### Free Tier
- 3 uploads per month
- Basic analysis reports
- PDF export only
- Email support

### Pro Tier ($29/month)
- Unlimited uploads
- AI chat functionality
- Advanced analytics
- Word & Notion export
- Priority support

### Enterprise Tier ($99/month)
- Everything in Pro
- Team collaboration
- API access
- Custom integrations
- Dedicated support

## 🛠 Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are set up

2. **Gemini AI Errors**
   - Validate API key
   - Check quota limits
   - Review content restrictions

3. **File Upload Issues**
   - Check file size limits (10MB)
   - Verify file type support
   - Ensure storage bucket exists

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logs.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Create a GitHub issue for bugs
- **Email**: support@financialanalyzer.com
- **Discord**: Join our community server

## 🗺 Roadmap

### Version 2.0
- [ ] Mobile app (React Native)
- [ ] Advanced chart types
- [ ] Real-time collaboration
- [ ] Webhook integrations

### Version 2.1
- [ ] Multi-language support
- [ ] Custom AI models
- [ ] White-label solutions
- [ ] Advanced security features

---

**Built with ❤️ by the Financial Analyzer Team**