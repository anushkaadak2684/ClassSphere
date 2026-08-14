# ClassSphere — Real-Time Virtual Classroom Platform (MVP)

A modern, production-quality Real-Time Virtual Classroom Platform built with React, Node.js, Express, MongoDB, Socket.io, WebRTC, Firebase Authentication, and Cloudinary.

---

## 1. Project Overview

ClassSphere enables educators to create and manage virtual classrooms, broadcast real-time HD video & screen sharing, interact with students via live chat and raised hands, share course handouts/materials, and automatically track student session attendance.

---

## 2. Key Features

### 👨‍🏫 Teacher Experience
* **Classroom Management**: Create, update, and delete classrooms with auto-generated unique 6-character join codes.
* **Live Classroom Sessions**: Start and end live video classes with a single click.
* **Interactive Media**: High-definition camera, microphone toggle, and crisp screen sharing via browser WebRTC.
* **Moderation Controls**: View live participant status, mute noisy students, or remove disruptive participants.
* **Teacher Announcements**: Broadcast high-priority classroom announcements directly into live chat.
* **Course Materials**: Upload lecture notes, slides, and PDFs (up to 25MB) securely to Cloudinary.
* **Attendance Tracking**: View automated join/leave timestamps and participation durations for all enrolled students.

### 🎓 Student Experience
* **Join via Code**: Enroll in virtual classrooms using a unique 6-character code.
* **Live Class Participation**: Join active live sessions with two-way audio and video.
* **Raise Hand**: Request speaking turn with real-time hand-raise status badges.
* **Classroom Chat**: Real-time messaging with instructors and peers.
* **Material Downloads**: Access and download course materials and lecture slides.

---

## 3. High-Level Architecture

```text
                                CLIENT
                        React + Vite + Tailwind
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ▼                         ▼
               Firebase Auth               REST API
                     │                         │
                     │                         ▼
                     │                  Node.js + Express
                     │                         │
                     │                 ┌───────┴───────┐
                     │                 │               │
                     │                 ▼               ▼
                     │              MongoDB        Cloudinary
                     │                                 │
                     ▼                                 │
                 Socket.io ────────────────────────────┘
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

## 4. Tech Stack

### Frontend
* **Core**: React 18, Vite, JavaScript
* **Styling**: Tailwind CSS (Neutral, academic SaaS palette)
* **Icons**: Lucide React
* **Routing**: React Router DOM (v7)
* **HTTP Client**: Axios (with Firebase ID token interceptors)
* **Real-Time**: Socket.io Client
* **Media**: Native Browser WebRTC APIs (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`)
* **Auth**: Firebase Client SDK

### Backend
* **Runtime**: Node.js & Express.js
* **Database**: MongoDB & Mongoose ORM
* **Real-Time & Signaling**: Socket.io
* **Authentication**: Firebase Admin SDK (ID token verification & role enforcement)
* **File Storage**: Cloudinary SDK & Multer (Memory Storage)

---

## 5. Folder Structure

```text
ClassSphere/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Modal, Card, Loader, ErrorMessage, EmptyState, Badge
│   │   │   ├── layout/         # Navbar, ProtectedRoute, RoleGuard
│   │   │   ├── classroom/      # ClassroomCard, CreateClassroomModal, JoinClassroomModal, ParticipantList, AttendanceTable
│   │   │   ├── video/          # VideoGrid, VideoTile, LiveControls
│   │   │   ├── chat/           # ChatPanel, ChatMessage
│   │   │   └── materials/      # MaterialList, MaterialUpload
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── hooks/              # useAuth, useSocket, useWebRTC
│   │   ├── services/           # api.js, auth.service.js, classroom.service.js
│   │   ├── pages/              # Login, Register, Dashboard, Classroom, LiveClassroom, Profile, NotFound
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
│   │   ├── models/             # User, Classroom, Enrollment, Message, Attendance, Material
│   │   ├── middleware/         # auth.middleware, role.middleware, upload.middleware, error.middleware
│   │   ├── controllers/        # user, classroom, material, attendance controllers
│   │   ├── services/           # classroom, attendance, cloudinary services
│   │   ├── routes/             # user, classroom, material, attendance routes
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

## 6. Environment Setup

### 1. Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/classsphere
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
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

## 7. Running Locally

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

## 8. WebRTC Architecture & Signaling Flow

1. **Local Media Acquisition**: User browser requests webcam/microphone via `navigator.mediaDevices.getUserMedia()`.
2. **Classroom Presence**: Client emits `classroom:join` through authenticated Socket.io connection.
3. **Peer Discovery**: Server sends active participant list to the joining peer.
4. **SDP Offer/Answer Exchange**:
   - Existing peer creates `RTCPeerConnection` and generates SDP offer.
   - Server relays offer to target peer via `webrtc:offer`.
   - Target peer sets remote description and responds with SDP answer via `webrtc:answer`.
5. **ICE Candidate Trickle**: Both peers discover and exchange network candidates via `webrtc:ice-candidate`.
6. **Screen Sharing**: Stream switched via `navigator.mediaDevices.getDisplayMedia()` by replacing outgoing video track on all active peer connections.

---

## 9. REST API Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/users/sync` | Authenticated | Create/sync user profile from Firebase auth |
| `GET` | `/api/users/me` | Authenticated | Get current user profile and role |
| `PUT` | `/api/users/me` | Authenticated | Update user name or avatar |
| `POST` | `/api/classrooms` | Teacher | Create a new classroom |
| `GET` | `/api/classrooms` | Authenticated | Get user's classrooms (created or enrolled) |
| `GET` | `/api/classrooms/:id` | Member | Get classroom details and student count |
| `PUT` | `/api/classrooms/:id` | Owner | Update classroom details |
| `DELETE` | `/api/classrooms/:id` | Owner | Delete classroom and cascade clean records |
| `POST` | `/api/classrooms/join` | Student | Join classroom with 6-character code |
| `GET` | `/api/classrooms/:id/participants` | Member | List enrolled students and teacher |
| `POST` | `/api/classrooms/:id/start` | Owner | Start live session (`isLive = true`) |
| `POST` | `/api/classrooms/:id/end` | Owner | End live session (`isLive = false`) |
| `POST` | `/api/classrooms/:id/materials` | Owner | Upload file to Cloudinary |
| `GET` | `/api/classrooms/:id/materials` | Member | List learning materials |
| `DELETE` | `/api/materials/:id` | Owner | Delete material from Cloudinary & DB |
| `GET` | `/api/classrooms/:id/attendance` | Owner | Get attendance logs & durations |

---

## 10. Future Improvements & Scaling

* **SFU Integration**: For classrooms exceeding 8-10 simultaneous video streams, upgrade mesh P2P to a Selective Forwarding Unit (e.g. Mediasoup or LiveKit).
* **Cloud Recording**: Server-side audio/video recording.
* **Collaborative Whiteboard**: Real-time vector canvas sharing.
