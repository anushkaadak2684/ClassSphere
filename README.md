# ClassSphere — Real-Time Virtual Classroom & Academic Management Platform

ClassSphere is a production-grade Real-Time Virtual Classroom and Academic Management Platform built with React 18, Node.js, Express, MongoDB Atlas, Socket.io, WebRTC, Firebase Authentication, Cloudinary, and Framer Motion.

---

## 1. Project Overview

ClassSphere unifies real-time WebRTC live lectures, collaborative classroom messaging, digital hand-raising, curriculum material distribution, assignment workflows, automated session attendance tracking, and live academic performance analytics into a single responsive application.

---

## 2. Key Features

### 👨‍🏫 Teacher Experience
* **Dashboard & Metrics**: Instant overview of active classes, total enrolled students, assignments awaiting evaluation, and live session status.
* **Classroom Management**: Create, update, and manage classrooms with auto-generated unique 6-character join codes.
* **Live WebRTC Classroom**: Start and end live HD video lectures with camera, microphone, and browser screen-sharing controls.
* **Real-Time Moderation**: Manage participant presence, mute noisy participants, and remove disruptive users.
* **Classroom Chat & Announcements**: Persistent messaging, public announcements, and digital hand-raise notifications.
* **Course Materials**: Upload lecture slides, PDF documents, and archives securely to Cloudinary.
* **Assignments & Grading**: Create assignments with due dates, maximum points, and starter attachments. Review student solution archives, grade submissions with numerical scores, and provide qualitative feedback.
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
            (Bearer Token Header)      (Axios Interceptor)
                     │                         │
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

## 4. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ CLASSROOM : "creates (teacher)"
    USER ||--o{ ENROLLMENT : "enrolls (student)"
    USER ||--o{ ATTENDANCE : "participates (student)"
    USER ||--o{ SUBMISSION : "submits (student)"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ MATERIAL : "uploads"

    CLASSROOM ||--o{ ENROLLMENT : "contains"
    CLASSROOM ||--o{ ATTENDANCE : "logs"
    CLASSROOM ||--o{ ASSIGNMENT : "hosts"
    CLASSROOM ||--o{ MATERIAL : "shares"
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

## 5. Authentication & Security Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Browser)
    participant FA as Firebase Auth
    participant API as Express REST API
    participant FAdmin as Firebase Admin SDK
    participant DB as MongoDB Atlas

    User->>FA: Sign In with Email & Password
    FA-->>User: Returns Firebase ID Token (JWT)
    User->>API: HTTP Request + Authorization: Bearer <ID_Token>
    API->>FAdmin: verifyIdToken(token)
    alt Invalid / Expired Token
        FAdmin-->>API: Token Verification Error
        API-->>User: 401 Unauthorized
    else Valid Token
        FAdmin-->>API: Decoded Token { uid, email }
        API->>DB: User.findOne({ firebaseUid: decoded.uid })
        alt User Not Found in DB
            API-->>User: 404 Please Sync Profile
        else User Exists
            API->>API: Attach req.user & req.firebaseUser
            API->>API: Execute Role & Ownership Middleware
            API->>DB: Process Controller Query
            DB-->>API: Return Result
            API-->>User: 200 OK + JSON Response
        end
    end
```

---

## 6. WebRTC Signaling & Glare-Free Peer Connection Flow

To prevent **WebRTC Glare** (dual-offer collisions when two peers attempt to call each other at the exact same moment), ClassSphere employs a **Designated Caller Protocol**:
1. When a new peer joins, the server returns the existing participants list (`classroom:participants`).
2. The newly joined peer initiates the SDP Offer (`webrtc:offer`) to each existing participant.
3. Existing participants do NOT initiate an offer; they receive the offer, configure remote description, and send an SDP Answer (`webrtc:answer`).

```mermaid
sequenceDiagram
    autonumber
    actor PeerB as Joining Peer (Student B)
    participant Socket as Socket.io Server
    actor PeerA as Existing Peer (Teacher A)

    PeerB->>Socket: emit("classroom:join", { classroomId })
    Socket->>PeerB: emit("classroom:participants", [PeerA])
    Socket->>PeerA: emit("classroom:user-joined", PeerB)

    Note over PeerB,PeerA: Peer B is designated initiator to Peer A
    PeerB->>PeerB: createOffer() -> setLocalDescription(offer)
    PeerB->>Socket: emit("webrtc:offer", { toPeerId: PeerA, offer })
    Socket->>PeerA: emit("webrtc:offer", { fromPeerId: PeerB, offer })

    PeerA->>PeerA: setRemoteDescription(offer) -> createAnswer() -> setLocalDescription(answer)
    PeerA->>Socket: emit("webrtc:answer", { toPeerId: PeerB, answer })
    Socket->>PeerB: emit("webrtc:answer", { fromPeerId: PeerA, answer })
    PeerB->>PeerB: setRemoteDescription(answer)

    Note over PeerB,PeerA: ICE Candidate Exchange (Trickle ICE)
    PeerB->>Socket: emit("webrtc:ice-candidate", candidate)
    Socket->>PeerA: emit("webrtc:ice-candidate", candidate)
    PeerA->>PeerA: addIceCandidate(candidate)

    Note over PeerA,PeerB: Direct P2P Audio / Video / Screen Stream Established
```

---

## 7. Role-Specific Information Architecture

| Feature / Section | Teacher View | Student View |
|---|---|---|
| **Dashboard** | Active classes, total students, pending grading, live class triggers | Enrolled classes, upcoming due dates, attendance stats, join class trigger |
| **My Classes** | Created classes, member counts, join codes, quick live launch | Enrolled classes, instructor details, subject cards |
| **Assignments** | Assignment creator, submission counts, grading interface & feedback modal | Assignment list, status badges (Turned In / Missing / Graded), upload submission drawer |
| **Students / Attendance** | **Students**: Roster across all classes, student search, individual performance drawer | **Attendance**: Dedicated personal attendance records, total sessions, and duration breakdown |
| **Progress** | **Progress**: Aggregate class health analytics, benchmark distributions, student leaderboard | **My Progress**: Personal academic growth metrics, turn-in rate, average score, and performance stats |
| **Profile** | Single-card profile editing, avatar customization, and password update | Single-card profile editing, avatar customization, and password update |

---

## 8. Scalability & Engineering Tradeoffs

### Current Architecture: WebRTC Full-Mesh Peer-to-Peer (P2P)
In ClassSphere's current architecture, media streams flow directly between client browsers without passing through a media server:
* **Advantages**:
  * **Ultra-Low Latency**: Direct peer-to-peer UDP packet transmission.
  * **Zero Media Server Cost**: The backend only routes lightweight signaling messages (SDP offers/answers and ICE candidates).
  * **End-to-End Encryption (E2EE)**: Native WebRTC encryption without server-side decryption.
* **Limitations**:
  * **Upstream Bandwidth Scaling**: Each participant sends their video/audio stream to $N-1$ peers. For $N$ participants, the network load is $O(N^2)$.
  * **Client CPU Utilization**: Encoding multiple outgoing streams and decoding incoming streams limits mesh rooms to **6–8 simultaneous video participants**.

### Production Upgrade Path: Selective Forwarding Unit (SFU)
For institutional deployments with 50–500+ participants per lecture, the platform can transition from P2P Full-Mesh to an **SFU Media Server** (e.g. Mediasoup or LiveKit):

```text
[Mesh Architecture: O(N^2)]               [SFU Architecture: O(N)]

     Peer A ─── Peer B                          Peer A     Peer B
       │  ╲   ╱   │                                ╲         ╱
       │   ╳    │                                   ▼       ▲
       │  ╱   ╲   │                               ┌───────────┐
     Peer C ─── Peer D                            │    SFU    │
                                                  │MediaServer│
                                                  └───────────┘
                                                    ▲       ▼
                                                   ╱         ╲
                                                Peer C     Peer D
```

* **How SFU Solves Scaling**:
  1. Each client publishes **1 uplink video/audio stream** to the SFU server ($O(1)$ client upload bandwidth).
  2. The SFU forwards incoming RTP packets to all subscribers without re-encoding ($O(N)$ server throughput).
  3. **Simulcast & SVC**: The publisher sends multiple resolutions (1080p, 720p, 360p), and the SFU dynamically forwards lower bitrates to peers with weaker network connections.

---

## 9. REST API Summary

### Authentication & Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/users/sync` | Authenticated | Create/sync user profile from Firebase auth |
| `GET` | `/api/users/me` | Authenticated | Get current user profile and role |
| `PUT` | `/api/users/me` | Authenticated | Update user display name or avatar URL |

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
| `POST` | `/api/classrooms/:id/end` | Owner | End live session & finalize student attendance |

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
| `GET` | `/api/assignments/:id` | Member | Get assignment details and submission status |
| `PUT` | `/api/assignments/:id` | Owner | Update assignment details and due date |
| `DELETE` | `/api/assignments/:id` | Owner | Delete assignment and associated submissions |
| `POST` | `/api/assignments/:id/submit` | Student | Submit assignment solution file to Cloudinary |
| `GET` | `/api/assignments/:id/submissions` | Owner | View all student submissions for an assignment |
| `GET` | `/api/assignments/:id/my-submission` | Student | View student's own submission and marks |
| `PUT` | `/api/submissions/:id/grade` | Owner | Grade submission with score and written feedback |

### Attendance & Progress Analytics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/classrooms/:id/attendance` | Owner | Get classroom attendance logs & durations |
| `GET` | `/api/attendance/my` | Student | Get student attendance history across all classes |
| `GET` | `/api/classrooms/:id/progress` | Member | Compute real-time classroom analytics and averages |
| `GET` | `/api/classrooms/:id/students/:studentId/details` | Owner | Get detailed individual performance records |

---

## 10. Environment Setup & Installation

### Prerequisites
* **Node.js**: v18.x or v20.x
* **MongoDB**: MongoDB Atlas URI or local instance (`mongodb://localhost:27017/classsphere`)
* **Firebase Project**: Firebase Auth enabled (Email/Password) with Firebase Admin service account credentials
* **Cloudinary Account**: Cloud Name, API Key, and API Secret

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

### 3. Running Locally

**Concurrently from Root:**
```bash
npm run dev
```

**Or Individually:**
```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm install
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm install
npm run dev
```
