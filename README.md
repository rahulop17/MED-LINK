# 🏥 MedLink

> A full-stack healthcare platform where doctors can share medical insights, patients can book appointments, and AI helps diagnose symptoms and suggest the right specialist.

---

## 🌟 Features

### For Patients
- 🔍 Browse and discover verified doctors by specialization
- 📅 Book appointments with doctors
- 🤖 AI-powered symptom checker with specialist recommendations
- 📰 Read medical insights published by doctors
- ❤️ Like and comment on doctor posts

### For Doctors
- 📝 Publish medical insights (LinkedIn-style feed)
- 🖼️ Post with images (uploaded to Cloudinary)
- 💬 Engage with comments and likes
- 📊 Manage appointments via clinical dashboard
- 🗓️ Set available schedule slots

### General
- 🔐 JWT-based authentication (access + refresh tokens)
- 👤 Role-based access control (patient / doctor / admin)
- 📱 Native share support on mobile
- ☁️ Cloud image storage via Cloudinary

---

## 🛠️ Tech Stack

### Frontend
| Tech | Usage |
|------|-------|
| React (Vite) | UI framework |
| React Router | Client-side routing |
| Axios | API requests |
| Tailwind CSS | Styling |
| Context API | Auth state management |

### Backend
| Tech | Usage |
|------|-------|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Multer | File upload handling |
| Cloudinary | Cloud image storage |
| Groq AI | Symptom checker AI |
| Razorpay | Payment integration |
| bcrypt | Password hashing |

---

## 📁 Project Structure

```
MEDLINK/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   └── razorpay.js
│   │   ├── controllers/
│   │   │   ├── admin.controller.js
│   │   │   ├── ai.controller.js
│   │   │   ├── appointment.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── doctor.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── post.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── multer.middleware.js
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── public/temp/
│   ├── app.js
│   └── index.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/
        │   └── ui/
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        ├── pages/
        │   ├── Feed.jsx
        │   ├── DoctorDash.jsx
        │   ├── DoctorList.jsx
        │   ├── DoctorProfile.jsx
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── MyAppointments.jsx
        │   └── SymptomChecker.jsx
        └── utils/
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Groq API key

### 1. Clone the repository
```bash
git clone https://github.com/rahulop17/MED-LINK.git
cd MED-LINK
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=8000
MONGODB_URI=your_mongodb_atlas_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```



### 3. Frontend Setup


## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register patient |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh-token` | Refresh access token |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors |
| GET | `/api/doctors/:id` | Get doctor profile |
| POST | `/api/doctors/register` | Register as doctor |

### Posts (Feed)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create post (doctor only) |
| GET | `/api/posts/feed` | Get all posts |
| POST | `/api/posts/:id/like` | Like/unlike post |
| POST | `/api/posts/:id/comments` | Add comment |
| GET | `/api/posts/:id/comments` | Get comments |
| DELETE | `/api/posts/:id` | Delete post (doctor only) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/my` | Get my appointments |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/symptom-check` | AI symptom checker |

---

## 🚀 Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Media Storage:** Cloudinary

---

## 🔐 Environment Variables

Never commit your `.env` file. All secrets are managed via environment variables. See the setup section above for the full list of required variables.

---

## 👨‍💻 Author

**Rahul** — Built as a learning project to explore full-stack MERN development, AI integration, and real-world product thinking.

> *"There's no dedicated space for doctors to express themselves professionally and for patients to discover the right specialist with AI assistance — MedLink bridges that gap."*

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
