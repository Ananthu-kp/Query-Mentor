# 🎓 Query Mentor - Doubt Clearing Platform

A full-stack Next.js application that connects students with instructors to resolve doubts efficiently. Built with modern web technologies and AI-powered answer suggestions.

## 🚀 Live Demo

**[View Live Application](https://query-mentor.vercel.app/)**

---


## 🎯 Problem Statement

In large online courses, student doubts often get:
- ❌ Repeated across multiple students
- ❌ Left unanswered for long periods
- ❌ Lost in lengthy discussion threads

**Solution:** Query Mentor centralizes doubt management, enables quick resolution, and creates a searchable knowledge base of resolved questions.

---

## ✨ Features

### 👨‍🎓 Student Features
- ✅ Create, edit, and delete doubts
- ✅ Real-time search through all doubts
- ✅ View instructor responses

### 👨‍🏫 Instructor Features
- ✅ View all student doubts with filtering (All/Open/Resolved)
- ✅ Answer doubts with detailed explanations
- ✅ **AI-Powered Answer Suggestions** using Groq (Llama 3.3 70B)
- ✅ Mark doubts as resolved
- ✅ Search and filter doubts
- ✅ Dashboard with statistics

### 🔐 Authentication & Security
- ✅ JWT-based authentication with NextAuth v4
- ✅ Role-based access control (Student/Instructor)
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ SQL injection prevention via Prisma ORM

### 🎨 UI/UX Features
- ✅ Responsive design for all devices
- ✅ Toast notifications for user feedback
- ✅ SweetAlert2 for delete confirmations
- ✅ Loading states for all async operations
- ✅ Form validation with real-time error messages
- ✅ Character counters for text inputs
- ✅ Gradient backgrounds and modern UI

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework

### Backend
- **Next.js API Routes** - Serverless functions
- **NextAuth v4** - Authentication
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database

### AI Integration
- **Groq API** - Free AI-powered answer suggestions (Llama 3.3 70B)

### Additional Libraries
- **react-hot-toast** - Toast notifications
- **sweetalert2** - Beautiful alerts
- **bcrypt** - Password hashing

---

## 📁 Folder Structure
```
query-mentor/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts          # NextAuth handler
│   │   │   └── register/
│   │   │       └── route.ts          # User registration
│   │   ├── doubts/
│   │   │   ├── route.ts              # GET all doubts, POST create doubt
│   │   │   ├── search/
│   │   │   │   └── route.ts          # Search doubts
│   │   │   └── [id]/
│   │   │       ├── route.ts          # PATCH update, DELETE doubt
│   │   │       ├── answers/
│   │   │       │   └── route.ts      # POST create answer
│   │   │       └── resolve/
│   │   │           └── route.ts      # PATCH mark as resolved
│   │   └── ai/
│   │       └── suggest-answer/
│   │           └── route.ts          # POST AI suggestion (Groq)
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── register/
│   │       └── page.tsx              # Registration page
│   ├── dashboard/
│   │   ├── page.tsx                  # Dashboard router
│   │   ├── student/
│   │   │   └── page.tsx              # Student dashboard
│   │   └── instructor/
│   │       └── page.tsx              # Instructor dashboard
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── db.ts                         # Prisma client instance
│   └── error-handler.ts              # Error handling utilities
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Database seeding
├── types/
│   └── next-auth.d.ts                # NextAuth type definitions
├── middleware.ts                     # Route protection middleware
├── .env                              # Environment variables
├── .env.example                      # Environment variables template
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Groq API key (free from [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/query-mentor.git
cd query-mentor
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/query_mentor"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="your-groq-api-key-here"
```

4. **Set up the database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with test users
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

---

## 🔌 API Routes

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/[...nextauth]` | Login user | Public |

### Doubts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/doubts` | Get all doubts | Required |
| POST | `/api/doubts` | Create doubt | Student |
| PATCH | `/api/doubts/[id]` | Update doubt | Owner/Instructor |
| DELETE | `/api/doubts/[id]` | Delete doubt | Owner/Instructor |
| GET | `/api/doubts/search` | Search doubts | Required |
| PATCH | `/api/doubts/[id]/resolve` | Mark as resolved | Required |

### Answers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/doubts/[id]/answers` | Create answer | Instructor |

### AI
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/suggest-answer` | Get AI suggestion | Instructor |

---

## 🎯 Key Highlights

### 1. **AI Integration**
- Uses Groq's free API with Llama 3.3 70B model
- Generates contextual, educational answers
- Instructors can edit AI suggestions before submitting
- Fast response times (<2 seconds)

### 2. **Security**
- JWT-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control
- SQL injection prevention via Prisma
- Protected API routes with middleware

### 3. **User Experience**
- Real-time search with debouncing (300ms)
- Form validation with character limits
- Loading states for all async operations
- Toast notifications for feedback
- SweetAlert2 for critical actions
- Responsive design for all devices

### 4. **Code Quality**
- TypeScript for type safety
- Clean code architecture
- Error handling in all API routes
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Reusable components
- Consistent naming conventions

### 5. **Performance**
- Server-side rendering (SSR)
- Optimized database queries with Prisma
- Indexed database fields for faster lookups
- CSS animations with GPU acceleration
- Lazy loading where appropriate

---

## 👤 Author

**Ananthakrishnan KP**

- GitHub: (https://github.com/Ananthu-kp)
- LinkedIn: (https://www.linkedin.com/in/ananthu-kp/)
---

## 🙏 Acknowledgments

- **House of Edtech** for the opportunity
- **Next.js** team for the amazing framework
- **Groq** for free AI API access
- **Vercel** for seamless deployment
- **Prisma** for the excellent ORM

---
