# ClassSphere — Real-Time Virtual Classroom & Academic Management Platform

ClassSphere is a modern, production-grade Real-Time Virtual Classroom and Academic Management Platform built with React 18, Node.js, Express, MongoDB, Socket.io, WebRTC, Firebase Authentication, Cloudinary, and Framer Motion.

---

## 1. Project Overview

ClassSphere bridges live video education and academic workflow into a unified, high-performance platform. It allows educators to broadcast low-latency WebRTC live lectures, interact via real-time messaging and digital hand-raising, distribute course materials, manage assignments and grading, automate session attendance logging, and inspect live progress analytics — all backed by persistent MongoDB Atlas storage and Firebase authentication.

---

## 2. Key Features

### 👨‍🏫 Teacher Experience
* **Dashboard & Metrics**: Instant overview of active classes, total enrolled students, assignments to grade, and live class status.
* **Classroom Management**: Create, edit, and manage classrooms with unique 6-character join codes.
* **Live WebRTC Classroom**: Start and end live HD video lectures with camera, microphone, and screen-sharing controls.
* **Real-Time Moderation**: Manage participant presence, mute noisy participants, and remove disruptive users.
* **Classroom Chat & Announcements**: Persistent messaging, public announcements, and digital hand-raise notifications.
* **Course Materials**: Upload lecture slides, PDF documents, and code archives securely to Cloudinary.
* **Assignments & Grading**: Create assignments with due dates, maximum points, and attachments. Review student submission archives, grade submissions, and provide qualitative feedback.
* **Students Management Roster**: Dedicated roster to search and inspect student performance across all classrooms. Interactive modal drawer displays individual attendance rates, turn-in percentages, average marks, and historical activity.
* **Academic Progress Analytics**: Aggregated class health analytics including average attendance rate, turn-in rate, class average score, benchmark distribution bars, and student performance tables.

### 🎓 Student Experience
* **Enrollment via Join Code**: Instantly join virtual classrooms using 6-character invite codes.
* **Live Lecture Participation**: Join active live sessions with two-way audio, video, chat, and digital hand-raising.
* **Coursework & Submissions**: View assigned homework, download starter files, submit solution archives, and track submission status.
* **Grades & Feedback**: Access real-time numerical marks and teacher feedback.
* **Attendance Hub**: Dedicated personal attendance portal showing overall attendance %, attended sessions, total sessions, and classroom-by-classroom records.
* **My Progress Analytics**: Personal academic growth dashboard computing turn-in percentage, attendance rate, and average marks across all enrolled subjects.
* **Course Materials Hub**: Browse and download instructor-provided lecture slides and documents.

### 🎨 Visuals & Aesthetics
* **Unified Profile Management**: Single cohesive profile card combining avatar customizer, personal information, and password modification.
* **Dark & Light Themes**: System-wide theme switcher with pure white light-mode aesthetics and sleek dark-mode styling.
* **Framer Motion Animations**: Micro-interactions, staggered card reveals, modal drawer transitions, and smooth tab switching.
* **Precision Scroll & Navigation**: Instant route scroll restoration via `ScrollToTop` and smooth in-page anchor navigation.

---

## 3. High-Level Architecture

```text
                                CLIENT
                React 18 + Vite + TailwindCSS + Framer Motion
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ▼                         ▼
               Firebase Auth               REST API
               (Token Interceptor)             │
                     │                         ▼
                     │                  Node.js + Express
                     │                         │
                     │                 ┌───────┴───────┐
                     │                 │               │
                     │                 ▼               ▼
                     │           MongoDB Atlas     Cloudinary
                     │           (Mongoose DB)   (Media Storage)
                     ▼                         │
                 Socket.io ────────────────────┘
                     │
             WebRTC Signaling
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
    Teacher                     Students
       │                           │
       └────────── WebRTC ─────────┘
            Audio / Video / Screen
```

---

## 4. Role-Specific Information Architecture

| Feature / Section | Teacher View | Student View |
|---|---|---|
| **Dashboard** | Active classes, total students, pending grading, live class triggers | Enrolled classes, upcoming due dates, attendance stats, join class trigger |
| **My Classes** | Created classes, member counts, join codes, quick live launch | Enrolled classes, instructor details, subject cards |
| **Assignments** | Assignment creator, submission counts, grading interface & feedback modal | Assignment list, status badges (Turned In / Missing / Graded), upload submission drawer |
| **Students / Attendance** | **Students**: Roster across all classes, student search, individual performance drawer | **Attendance**: Dedicated personal attendance records, total sessions, and duration breakdown |
| **Progress** | **Progress**: Aggregate class health analytics, benchmark distributions, student leaderboard | **My Progress**: Personal academic growth metrics, turn-in rate, average score, and performance stats |
| **Profile** | Single-card profile editing, avatar customization, and password update | Single-card profile editing, avatar customization, and password update |

---

## 5. Tech Stack

### Frontend
* **Core**: React 18, Vite, JavaScript (ES6+)
* **Styling**: Tailwind CSS (Neutral, academic SaaS palette)
* **Animations**: Framer Motion
* **Icons**: Lucide React
* **Routing**: React Router DOM (v7)
* **HTTP Client**: Axios (with Firebase ID token interceptors)
* **Real-Time & Sockets**: Socket.io Client
* **Media & Streaming**: Native Browser WebRTC (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`)
* **Auth**: Firebase Client SDK

### Backend
* **Runtime**: Node.js & Express.js
* **Database**: MongoDB Atlas & Mongoose ORM
* **Real-Time & Signaling**: Socket.io
* **Authentication**: Firebase Admin SDK (Bearer token verification & role-based middleware)
* **File Storage**: Cloudinary SDK & Multer (Memory Storage)

---

## 6. Folder Structure

```text
ClassSphere/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Modal, Card, Loader, ErrorMessage, EmptyState, Badge, ScrollToTop, ThemeToggle
│   │   │   ├── layout/         # AppLayout, Sidebar, ProtectedRoute, RoleGuard
│   │   │   ├── classroom/      # ClassroomCard, CreateClassroomModal, JoinClassroomModal, ParticipantList, AttendanceTable
│   │   │   ├── assignment/     # AssignmentCard, CreateAssignmentModal, SubmissionModal, GradeSubmissionModal
│   │   │   ├── progress/       # ProgressView, MetricCard, BenchmarkBar
│   │   │   ├── video/          # VideoGrid, VideoTile, LiveControls
│   │   │   ├── chat/           # ChatPanel, ChatMessage
│   │   │   └── materials/      # MaterialList, MaterialUpload
│   │   ├── context/            # AuthContext, SocketContext, ThemeContext
│   │   ├── hooks/              # useAuth, useSocket, useWebRTC
│   │   ├── services/           # api.js, auth.service.js, classroom.service.js, assignment.service.js, progress.service.js
│   │   ├── pages/              # Landing, Login, Register, Dashboard, MyClasses, Classroom, LiveClassroom, AssignmentsPage, StudentsPage, AttendancePage, ProgressPage, Profile, NotFound
│   │   ├── firebase/           # firebaseConfig.js
│   │   ├── routes/             # AppRoutes.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # db.js, firebase.js, cloudinary.js
│   │   ├── models/             # User, Classroom, Enrollment, Message, Attendance, Material, Assignment, Submission
│   │   ├── middleware/         # auth.middleware, role.middleware, upload.middleware, error.middleware
│   │   ├── controllers/        # user, classroom, material, attendance, assignment, progress controllers
│   │   ├── services/           # classroom, attendance, cloudinary, progress services
│   │   ├── routes/             # user, classroom, material, attendance, assignment, progress routes
│   │   ├── sockets/            # socket.js, classroom.socket.js, chat.socket.js, webrtc.socket.js
│   │   ├── utils/              # generateJoinCode.js, asyncHandler.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 7. Environment Setup

### 1. Backend Configuration (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/classsphere?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Frontend Configuration (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 8. Running Locally

### Option A: Run Backend & Frontend Concurrently (Root)
```bash
npm run dev
```

### Option B: Run Individually

**Start Backend Server:**
```bash
cd server
npm install
npm run dev
```
Backend will start on `http://localhost:5000`.

**Start Frontend Client:**
```bash
cd client
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 9. WebRTC Signaling Architecture

```text
1. Local Media    ──> Client requests webcam/mic via navigator.mediaDevices.getUserMedia()
2. Join Presence  ──> Client emits 'classroom:join' through authenticated Socket.io connection
3. Peer Discovery ──> Server sends active peer IDs to the joining client
4. SDP Offer      ──> Existing peer creates RTCPeerConnection and emits 'webrtc:offer'
5. SDP Answer     ──> Joining peer receives offer, sets remote description, emits 'webrtc:answer'
6. ICE Exchange   ──> Both peers discover and exchange ICE candidates via 'webrtc:ice-candidate'
7. Screen Share   ──> Video track replaced live via navigator.mediaDevices.getDisplayMedia()
```

---

## 10. REST API Summary

### Authentication & Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/users/sync` | Authenticated | Create/sync user profile from Firebase auth |
| `GET` | `/api/users/me` | Authenticated | Get current user profile and role |
| `PUT` | `/api/users/me` | Authenticated | Update user display name or avatar URL |
| `GET` | `/api/users/my-progress` | Student | Get student aggregate academic progress metrics |

### Classrooms & Sessions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/classrooms` | Teacher | Create a new classroom |
| `GET` | `/api/classrooms` | Authenticated | Get user's classrooms (created or enrolled) |
| `GET` | `/api/classrooms/:id` | Member | Get classroom details and participant counts |
| `PUT` | `/api/classrooms/:id` | Owner | Update classroom name, subject, or description |
| `DELETE` | `/api/classrooms/:id` | Owner | Delete classroom and cascade clean records |
| `POST` | `/api/classrooms/join` | Student | Join classroom with 6-character code |
| `GET` | `/api/classrooms/:id/participants` | Member | List enrolled students and teacher |
| `POST` | `/api/classrooms/:id/start` | Owner | Start live session (`isLive = true`) |
| `POST` | `/api/classrooms/:id/end` | Owner | End live session (`isLive = false`) |

### Materials & Handouts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/classrooms/:id/materials` | Owner | Upload file to Cloudinary & record material |
| `GET` | `/api/classrooms/:id/materials` | Member | List learning materials for a classroom |
| `DELETE` | `/api/materials/:id` | Owner | Delete material from Cloudinary & database |

### Assignments & Submissions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/classrooms/:id/assignments` | Owner | Create assignment with due date & attachments |
| `GET` | `/api/classrooms/:id/assignments` | Member | List all assignments for a classroom |
| `GET` | `/api/assignments/my` | Authenticated | List all assignments across user's enrolled/created classes |
| `GET` | `/api/assignments/:id` | Member | Get assignment details and submission status |
| `POST` | `/api/assignments/:id/submissions` | Student | Submit assignment solution file to Cloudinary |
| `GET` | `/api/assignments/:id/submissions` | Owner | View all student submissions for an assignment |
| `PUT` | `/api/submissions/:id/grade` | Owner | Grade submission with score and written feedback |

### Attendance & Progress Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/classrooms/:id/attendance` | Owner | Get classroom attendance logs & durations |
| `GET` | `/api/attendance/student` | Student | Get student attendance history across all classes |
| `GET` | `/api/classrooms/:id/progress` | Member | Compute real-time classroom analytics and averages |
| `GET` | `/api/classrooms/:id/students/:studentId/details` | Owner | Get detailed individual performance records |

---

## 11. Security & Quality Assurance

* **Firebase Admin Token Interceptor**: All API requests pass through token verification middleware.
* **Role-Based Access Control (RBAC)**: Strict separation between `teacher` and `student` operations.
* **Cascading Deletes**: Deleting a classroom removes enrollments, attendance records, messages, materials, and submissions cleanly.
* **Responsive Design**: Mobile drawer navigation, adaptive video grids, and responsive data tables.
* **Zero Mock Data**: Turn-in rates, attendance stats, and average marks compute dynamically from live MongoDB collections.

---

## 12. License

This project is licensed under the MIT License.
