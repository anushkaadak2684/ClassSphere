# ClassSphere — Real-Time Virtual Classroom & Academic Management Platform

ClassSphere is a full-stack virtual classroom and academic management platform that combines peer-to-peer video conferencing, WebSocket state synchronization, automated session attendance tracking, structured coursework delivery, and academic analytics into a single unified system.

---

## 1. Project Overview

Online education workflows are frequently fragmented across disconnected tools: video calls happen in one app, file distribution in another, attendance is taken manually, and grading is handled on separate spreadsheets. 

ClassSphere bridges this gap by unifying synchronous live collaboration with asynchronous academic administration:
* **Synchronous Live Classroom**: WebRTC peer-to-peer audio, video, and screen sharing coupled with Socket.io dynamic attendee presence, hand-raising queues, persistent live chat, and remote instructor moderation.
* **Asynchronous Academic Workflows**: Cloudinary-backed curriculum distribution, assignment submissions, numerical grading drawers with qualitative feedback, automated session duration logging, and performance analytics with CSV exports.

---

## 2. Core Features

### Teacher Capabilities
* **Classroom Lifecycle**: Create and manage classrooms with auto-generated 6-character join codes.
* **Live Lecture Control**: Start/end sessions, broadcast audio/video streams, and share browser screens.
* **Session Moderation**: Track real-time presence, manage ordered hand-raise queues, and remotely mute or kick participants.
* **Coursework & Evaluation**: Publish assignments with attachments and deadlines, inspect student submission archives, assign numerical grades, and return qualitative feedback.
* **Curriculum Management**: Upload lecture slides, PDF resources, and starter archives directly to Cloudinary CDN.
* **Analytics & Roster**: View class health metrics (attendance %, turn-in %, class average score, grade distributions), inspect individual student progress drawers, and export roster/gradebook data to CSV.

### Student Capabilities
* **Instant Enrollment**: Enroll in virtual classrooms using 6-character join codes.
* **Interactive Live Participation**: Join active lectures with two-way media, screen sharing, live chat, and digital hand-raising.
* **Coursework Submissions**: Download assignment briefs, submit solution archives to Cloudinary, and view grades and feedback.
* **Curriculum Hub**: Access and download instructor-published course materials and lecture notes.
* **Attendance Portal**: View historical lecture attendance records, total sessions attended vs. held, session durations, and export logs to CSV.
* **Academic Growth**: Track personal turn-in rates, average scores across classes, and subject-level performance metrics.

---

## 3. Technical Architecture & Implementation

### Frontend (React 18 + Vite)
* **State & Networking**: React Context (`AuthContext`, `SocketContext`) maintains persistent auth sessions and WebSocket connections across route transitions.
* **Custom WebRTC Hook (`useWebRTC`)**: Encapsulates `RTCPeerConnection` lifecycles, media tracks (audio, video, `getDisplayMedia` screen sharing), renegotiation, and ICE candidate buffering.
* **Routing & Security**: `react-router-dom` with role-aware `ProtectedRoute` guards verifying Firebase JWTs and user roles before rendering views.
* **UI Layer**: Styled with TailwindCSS and Framer Motion for hardware-accelerated drawer transitions and modal animations.

### Backend (Node.js + Express)
* **Layered Architecture**: Express REST routes delegate to dedicated controllers and services (`attendance.service.js`, `progress.service.js`).
* **Deterministic Request Validation**: Joi validation schemas executed via reusable `validateBody` middleware to sanitize inputs prior to controller execution.
* **Authentication & RBAC**: `auth.middleware.js` verifies Firebase JWTs via Firebase Admin SDK, maps tokens to MongoDB `User` documents, and enforces role and classroom ownership permissions (`requireRole`, `requireClassroomOwner`, `requireClassroomMember`).
* **Error Handling**: Centralized error middleware handling operational errors, Mongoose validation failures, Firebase token errors, and unhandled exceptions.

### Real-Time Layer (Socket.io)
* **Isolated Room Namespaces**: Scoped to `classroom:${classroomId}` to eliminate cross-class data leakage.
* **Dynamic In-Memory Presence**: Server-side map tracks active participants, media states, and hand-raise queues.
* **Database Hydration**: Preloads the latest 100 chat messages from MongoDB upon room entry.
* **Lifecycle-Aware Attendance Logging**: Records student join timestamps on `classroom:join`, calculates duration ($leftAt - joinedAt$) on departure or socket disconnect, and categorizes status (`present`, `partial`, `absent`).

### Media Pipeline (WebRTC + Cloudinary)
* **Mesh Topology**: P2P full-mesh where each peer connects directly to all other room participants.
* **Designated Caller Protocol**: Newly joined peers act as the designated offer initiators to all existing participants, preventing SDP collision glare.
* **Screen Sharing**: Swaps video `RTCRtpSender` track dynamically with display capture track, reverting cleanly on track end.
* **NAT Traversal**: Configured with Google public STUN servers for ICE candidate discovery.
* **Asset Storage**: Multipart files are buffered in memory via `multer` and streamed directly to Cloudinary CDN, storing secure HTTPS URLs and public IDs in MongoDB.

---

## 4. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (React 18 + Vite)"]
        UI[React Components & Pages]
        AuthCtx[Auth Context & Firebase SDK]
        SocketClient[Socket.io Client]
        WebRTCClient[WebRTC PeerConnections]
    end

    subgraph AuthLayer["Authentication Service"]
        FA[Firebase Auth Service]
    end

    subgraph ServerLayer["Backend Server (Node.js + Express)"]
        HTTP[Express HTTP Server]
        AuthMW[Firebase Token Verification MW]
        RBAC[Role & Ownership MW]
        JoiMW[Joi Request Validation MW]
        Controllers[API Controllers]
        SocketServer[Socket.io Server]
        Services[Attendance & Progress Services]
    end

    subgraph MediaLayer["External Cloud & P2P Media"]
        Cloudinary[(Cloudinary Media Storage)]
        Peers((WebRTC Peer Mesh))
    end

    subgraph DatabaseLayer["Database (MongoDB Atlas)"]
        MongoDB[(MongoDB Mongoose ODM)]
    end

    %% Auth Flow
    UI -->|1. Sign In / Token Request| FA
    FA -->|2. ID Token JWT| UI
    UI -->|3. REST API Requests + Bearer Token| HTTP

    %% REST Pipeline
    HTTP --> AuthMW
    AuthMW -->|Verify ID Token| FA
    AuthMW --> RBAC
    RBAC --> JoiMW
    JoiMW --> Controllers
    Controllers --> Services
    Services --> MongoDB
    Controllers --> MongoDB
    Controllers -->|Upload / Delete Media| Cloudinary

    %% Real-Time & WebRTC Pipeline
    UI -->|WebSocket Connect| SocketClient
    SocketClient <-->|Room Join, Presence, Chat, Moderation| SocketServer
    SocketServer <-->|Attendance Logging & Chat Hydration| MongoDB
    SocketClient <-->|Signaling: SDP Offer/Answer, ICE| SocketServer
    WebRTCClient <===>|Direct P2P Audio, Video, Screen Sharing| Peers
```

---

## 5. Important APIs & Real-Time Events

### REST API Reference

| Domain | Method | Endpoint | Access | Purpose |
|---|---|---|---|---|
| **Users** | `POST` | `/api/users/sync` | Authenticated | Syncs/creates user profile in MongoDB from verified Firebase token |
| **Users** | `GET` | `/api/users/me` | Authenticated | Retrieves current authenticated user profile and role |
| **Users** | `PUT` | `/api/users/me` | Authenticated | Updates display name and avatar URL (validated by Joi) |
| **Classrooms** | `POST` | `/api/classrooms` | Teacher | Creates a classroom and auto-generates a unique join code |
| **Classrooms** | `GET` | `/api/classrooms` | Authenticated | Retrieves all classrooms created by or enrolled in by user |
| **Classrooms** | `GET` | `/api/classrooms/:id` | Member | Returns classroom details, enrollment count, and teacher info |
| **Classrooms** | `PUT` | `/api/classrooms/:id` | Owner | Updates classroom name, subject, or description |
| **Classrooms** | `DELETE` | `/api/classrooms/:id` | Owner | Deletes classroom and cascades deletion of related records |
| **Classrooms** | `POST` | `/api/classrooms/join` | Student | Enrolls a student using a 6-character uppercase join code |
| **Classrooms** | `POST` | `/api/classrooms/:id/start` | Owner | Starts live session (`isLive: true`) |
| **Classrooms** | `POST` | `/api/classrooms/:id/end` | Owner | Ends live session and finalizes active attendance records |
| **Assignments**| `POST` | `/api/classrooms/:id/assignments` | Owner | Creates assignment with due date, max marks, and attachment |
| **Assignments**| `GET` | `/api/classrooms/:id/assignments` | Member | Lists all assignments for a classroom |
| **Assignments**| `POST` | `/api/assignments/:id/submit` | Student | Uploads submission archive to Cloudinary and saves record |
| **Assignments**| `GET` | `/api/assignments/:id/submissions` | Owner | Lists all student submissions for evaluation |
| **Assignments**| `PUT` | `/api/submissions/:id/grade` | Owner | Assigns numerical marks and feedback (validated by Joi) |
| **Materials**  | `POST` | `/api/classrooms/:id/materials` | Owner | Uploads document to Cloudinary and creates material record |
| **Materials**  | `GET` | `/api/classrooms/:id/materials` | Member | Lists curriculum materials for a classroom |
| **Materials**  | `DELETE` | `/api/materials/:id` | Owner | Deletes asset from Cloudinary and removes database record |
| **Attendance** | `GET` | `/api/classrooms/:id/attendance` | Owner | Retrieves session logs, student timestamps, and durations |
| **Attendance** | `GET` | `/api/attendance/my` | Student | Returns student's personal attendance history across classes |
| **Progress**   | `GET` | `/api/classrooms/:id/progress` | Member | Aggregates class attendance %, turn-in %, and grade distribution |
| **Progress**   | `GET` | `/api/classrooms/:id/students/:studentId/details` | Owner | Returns deep-dive individual metrics, submissions, and logs |

### Socket.io & WebRTC Event Reference

| Event Name | Direction | Description |
|---|---|---|
| `classroom:join` | Client $\rightarrow$ Server | Joins classroom room, registers presence, logs attendance join |
| `classroom:participants` | Server $\rightarrow$ Client | Transmits active room participant list to newly joined peer |
| `classroom:user-joined` / `user-left` | Server $\rightarrow$ Room | Broadcasts participant entry or exit to room |
| `classroom:raise-hand` / `lower-hand` | Client $\rightarrow$ Server | Updates student hand-raise state in room queue |
| `classroom:mute-user` / `kick-user` | Teacher $\rightarrow$ Server | Forces remote mute or evicts target attendee from room |
| `classroom:chat-message` | Client $\rightarrow$ Server | Persists message to MongoDB and broadcasts to room |
| `classroom:chat-history` | Server $\rightarrow$ Client | Transmits past 100 historical messages upon joining room |
| `webrtc:offer` / `webrtc:answer` | Peer $\leftrightarrow$ Server $\leftrightarrow$ Peer | Relays SDP offer/answer between initiating and target peers |
| `webrtc:ice-candidate` | Peer $\leftrightarrow$ Server $\leftrightarrow$ Peer | Relays Trickle ICE candidates between peers |
| `webrtc:peer-disconnected` | Server $\rightarrow$ Room | Signals peers to tear down `RTCPeerConnection` for departed user |

---

## 6. Data Model

```mermaid
erDiagram
    USER ||--o{ CLASSROOM : "creates (teacher)"
    USER ||--o{ ENROLLMENT : "enrolls (student)"
    USER ||--o{ ATTENDANCE : "logs attendance"
    USER ||--o{ SUBMISSION : "submits solution"
    USER ||--o{ MESSAGE : "authors"
    USER ||--o{ MATERIAL : "uploads"

    CLASSROOM ||--o{ ENROLLMENT : "contains"
    CLASSROOM ||--o{ ATTENDANCE : "tracks"
    CLASSROOM ||--o{ ASSIGNMENT : "hosts"
    CLASSROOM ||--o{ MATERIAL : "stores"
    CLASSROOM ||--o{ MESSAGE : "records"

    ASSIGNMENT ||--o{ SUBMISSION : "receives"

    USER {
        ObjectId _id PK
        string firebaseUid UK
        string name
        string email UK
        string role "teacher | student"
        string avatarUrl
        datetime createdAt
    }

    CLASSROOM {
        ObjectId _id PK
        string name
        string subject
        string description
        ObjectId teacher FK
        string joinCode UK
        boolean isLive
        datetime liveStartedAt
        datetime liveEndedAt
    }

    ENROLLMENT {
        ObjectId _id PK
        ObjectId classroom FK
        ObjectId student FK
        string status "active | dropped"
        datetime joinedAt
    }

    ASSIGNMENT {
        ObjectId _id PK
        ObjectId classroom FK
        ObjectId createdBy FK
        string title
        string description
        datetime dueDate
        number maxMarks
        object attachment
    }

    SUBMISSION {
        ObjectId _id PK
        ObjectId assignment FK
        ObjectId classroom FK
        ObjectId student FK
        object file
        string comment
        string status "submitted | graded"
        number marks
        string feedback
        datetime submittedAt
        datetime gradedAt
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId classroom FK
        ObjectId student FK
        datetime sessionDate
        datetime joinedAt
        datetime leftAt
        number duration
        string status "present | partial | absent"
    }

    MATERIAL {
        ObjectId _id PK
        ObjectId classroom FK
        ObjectId uploadedBy FK
        string name
        string description
        string secureUrl
        string cloudinaryPublicId
        number fileSize
    }

    MESSAGE {
        ObjectId _id PK
        ObjectId classroom FK
        ObjectId sender FK
        string content
        string type "CHAT | ANNOUNCEMENT"
        datetime createdAt
    }
```

---

## 7. Trade-offs, Limitations & Future Roadmap

### Architectural Trade-offs
* **WebRTC P2P Mesh vs. SFU**: P2P full-mesh requires zero media server infrastructure and delivers ultra-low latency, but client upload bandwidth scales as $O(N)$ and total connections as $O(N^2)$, limiting practical room capacity to 6–8 active video participants.
* **In-Memory Sockets vs. Redis Adapter**: Single-node in-memory socket state provides sub-millisecond dispatch without external infrastructure overhead, but limits real-time scaling across multiple Node.js process instances.
* **On-Demand Aggregations vs. Pre-Calculated Rollups**: Mongoose aggregation pipelines guarantee immediate data freshness for grades and attendance at the cost of computational query overhead on large datasets.
* **Firebase Auth vs. Custom Auth**: Firebase offloads secure password hashing, brute-force protection, and token rotation at the expense of external service dependency.

### Current Limitations
* **Mesh Scalability**: Video quality and client performance degrade beyond 6–8 concurrent video broadcasters.
* **Single-Node State**: Room presence and signaling state reside in process memory.
* **Public STUN Only**: Lacks dedicated TURN relay infrastructure; clients behind strict symmetric NATs may experience connection failures.
* **Synchronous Memory Uploads**: Large file uploads buffer in Node.js server memory before streaming to Cloudinary.

### Future Roadmap
* **SFU Integration**: Adopt LiveKit or Mediasoup to switch to $O(1)$ client uplink, enabling 100+ participant lectures.
* **Clustered Socket State**: Integrate `@socket.io/redis-adapter` for multi-instance horizontal scaling.
* **TURN Relay Infrastructure**: Deploy dedicated coturn servers for guaranteed firewall traversal.
* **Direct Client Uploads**: Use backend signed upload signatures allowing clients to upload large submission archives directly to Cloudinary CDN.
* **Automated Testing & CI/CD**: Add Jest, Supertest, and Playwright suites to GitHub Actions.

---

## 8. Tech Stack & Directory Structure

### Tech Stack
| Technology | Role in ClassSphere |
|---|---|
| **React 18 + Vite** | Component-driven frontend SPA, fast development server, and optimized bundling |
| **TailwindCSS + Framer Motion** | Utility styling, responsive layouts, and hardware-accelerated drawer transitions |
| **Socket.io** | Bi-directional WebSocket signaling, room presence, moderation, and live chat |
| **WebRTC** | Native browser peer-to-peer audio, video, and screen sharing |
| **Node.js + Express** | REST API layer, middleware pipeline, and WebSocket server integration |
| **MongoDB Atlas + Mongoose** | NoSQL cloud database with compound indexes and multi-stage aggregation pipelines |
| **Firebase Auth & Admin SDK** | Client authentication and stateless server-side JWT verification |
| **Joi** | Deterministic request body schema validation |
| **Cloudinary + Multer** | Multipart media buffering and global CDN asset distribution |

### Directory Structure
```text
ClassSphere/
├── client/                           # React Frontend SPA
│   ├── src/
│   │   ├── components/               # UI components (Classroom, Navbar, Drawers, etc.)
│   │   ├── context/                  # AuthContext, SocketContext
│   │   ├── firebase/                 # Firebase client SDK initialization
│   │   ├── hooks/                    # Custom hooks (useAuth, useSocket, useWebRTC)
│   │   ├── pages/                    # Route views (Dashboard, LiveClassroom, Assignments, etc.)
│   │   ├── routes/                   # AppRoutes and ProtectedRoute guards
│   │   ├── services/                 # Axios API instances
│   │   └── utils/                    # CSV export utilities
│   ├── package.json
│   └── vite.config.js
│
├── server/                           # Node.js + Express Backend
│   ├── src/
│   │   ├── config/                   # MongoDB, Firebase Admin, Cloudinary configurations
│   │   ├── controllers/              # REST request handlers
│   │   ├── middleware/               # Auth verification, RBAC, Joi validation, error handling
│   │   ├── models/                   # Mongoose schemas (User, Classroom, Assignment, etc.)
│   │   ├── routes/                   # Express route definitions
│   │   ├── schemas/                  # Joi validation schemas
│   │   ├── services/                 # Business logic (attendance, progress calculations)
│   │   ├── sockets/                  # Socket.io handlers (classroom, chat, webrtc)
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server bootstrap
│   └── package.json
│
├── package.json                      # Root scripts
└── README.md                         # Engineering documentation
```

---

## 9. Running the Project

### Prerequisites
* **Node.js**: v18.x or v20.x
* **MongoDB**: MongoDB Atlas URI or local instance (`mongodb://localhost:27017/classsphere`)
* **Firebase Project**: Firebase Auth enabled (Email/Password) with Admin SDK credentials
* **Cloudinary Account**: Cloud Name, API Key, and API Secret

---

### Step 1: Install Dependencies
```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

---

### Step 2: Environment Configuration

#### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/classsphere?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Cloudinary CDN Storage
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Frontend (`client/.env`)
```env
# Firebase Client SDK
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Service Endpoints
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### Step 3: Start Development Servers

```bash
# Concurrently from root:
npm run dev

# Or in separate terminals:
# Terminal 1 (Backend):
cd server && npm run dev

# Terminal 2 (Frontend):
cd client && npm run dev
```

---

### Step 4: Verification
1. Navigate to `http://localhost:5173` in a modern browser.
2. Register as a **Teacher** to create a classroom, start live lectures, and publish assignments.
3. In an incognito window, register as a **Student** to join using the 6-character code and test live video, chat, hand-raising, and coursework workflows.
