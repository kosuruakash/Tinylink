# TinyLink - URL Shortener

A full-stack URL shortener application similar to bit.ly, built with React.js frontend and Node.js/Express backend with PostgreSQL database.

## 🚀 Features

### Core Functionality
- **Short URL Creation**: Convert long URLs to short codes (6-8 characters)
- **URL Redirection**: Automatic redirect with click tracking
- **Link Management**: View, search, and delete shortened URLs
- **Analytics**: Track click counts and last accessed times
- **Health Monitoring**: System status and performance monitoring

### User Interface
- **Dashboard**: Main interface for link management
- **Create Links**: Form with validation for new short URLs
- **All Links View**: Browse all shortened URLs in the system
- **Statistics**: Detailed analytics for individual links
- **Health Check**: System status monitoring
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation and routing
- **CSS3** - Styling with modern features
- **React Icons** - Beautiful icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Deployment & Services
- **Vercel/Render/Railway** - Hosting platforms
- **Neon** - PostgreSQL database service

## 📁 Project Structure

```
tinylink/
├── frontend/
│   ├── src/
│   │   ├── Component/
│   │   │   ├── Home.js          # Main dashboard
│   │   │   ├── Dashboard.js     # Stats page for individual codes
│   │   │   ├── AllLinks.js      # View all system links
│   │   │   ├── HealthCheck.js   # System health monitoring
│   │   │   └── Shorturl.js      # Individual URL component
│   │   ├── App.js              # Main app component
│   │   ├── index.js            # React DOM render
│   │   └── *.css               # Styling files
│   └── package.json
├── backend/
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment variables**:
   Create a `.env` file with:
   ```env
   PGHOST=your_postgres_host
   PGDATABASE=your_database_name
   PGUSER=your_username
   PGPASSWORD=your_password
   PORT=3000
   ```

4. **Database setup**:
   ```sql
   CREATE TABLE links (
     id SERIAL PRIMARY KEY,
     short_code VARCHAR(8) UNIQUE NOT NULL,
     long_url TEXT NOT NULL,
     clicks INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     last_clicked_at TIMESTAMP
   );
   ```

5. **Start backend server**:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3001`

## 📚 API Documentation

### Health Check
- **GET** `/healthz`
- **Response**: `{ "ok": true, "version": "1.0" }`

### URL Management
- **POST** `/api/links`
  - **Body**: `{ "longurl": "https://example.com", "shortcode": "example" }`
  - **Success**: 201 Created
  - **Conflict**: 409 if code exists

- **GET** `/api/links`
  - **Response**: Array of all links

- **GET** `/api/links/:code`
  - **Response**: Single link statistics

- **DELETE** `/api/links/:code`
  - **Success**: 200 OK
  - **Not Found**: 404 if code doesn't exist

### Redirection
- **GET** `/:code`
  - **Success**: 302 Redirect to long URL
  - **Not Found**: 404 if code doesn't exist

## 🎯 Usage

### Creating Short Links
1. Navigate to the dashboard (`/`)
2. Enter the destination URL
3. Provide a custom short code (6-8 alphanumeric characters)
4. Click "Get your link"
5. Use the generated short URL: `http://yourdomain.com/yourcode`

### Managing Links
- **My Links**: View your created links with search functionality
- **All Links**: Browse all shortened URLs in the system
- **Statistics**: Click on any link to view detailed analytics
- **Delete**: Remove unwanted short URLs

### Health Monitoring
- Click "Health Check" to view system status
- Monitor response times and service availability
- Refresh to get latest status

## 🧪 Testing

The application follows specific conventions for automated testing:

### Required Endpoints
```javascript
// Backend endpoints (must match exactly)
POST /api/links      // Create short link
GET /api/links       // List all links
GET /api/links/:code // Get link stats
DELETE /api/links/:code // Delete link
GET /healthz         // Health check

// Frontend routes (must match exactly)
/                    // Dashboard
/code/:code          // Stats page
/:code               // Redirect
```

### Test Scenarios
1. Health endpoint returns 200
2. Creating links with duplicate codes returns 409
3. Redirect increments click count
4. Deleted links return 404
5. Proper form validation

## 🎨 UI Components

### Home (Dashboard)
- Create new short links
- Search and filter existing links
- Toggle between "My Links" and "All Links"
- Access health monitoring

### Shorturl Component
- Display short and long URLs
- Copy to clipboard functionality
- Click statistics and timestamps
- Delete and analytics actions

### HealthCheck Component
- Real-time system status
- Response time monitoring
- Service availability indicators
- Refresh functionality

## 🔧 Configuration

### Environment Variables
- `PGHOST`: PostgreSQL host
- `PGDATABASE`: Database name
- `PGUSER`: Database username
- `PGPASSWORD`: Database password
- `PORT`: Server port (default: 3000)

### Database Schema
```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(8) UNIQUE NOT NULL,
  long_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_clicked_at TIMESTAMP
);
```

## 🚀 Deployment

### Backend Deployment
- **Vercel**: Configure for Node.js
- **Render**: Use Web Service setup
- **Railway**: Connect GitHub repository

### Frontend Deployment
- **Vercel**: Optimal for React apps
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting option

### Database
- **Neon**: Free PostgreSQL hosting
- Configure connection strings in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify environment variables
   - Check PostgreSQL service status
   - Ensure SSL configuration

2. **CORS Errors**
   - Verify frontend URL in backend CORS configuration
   - Check port numbers match

3. **Link Not Redirecting**
   - Verify short code exists in database
   - Check URL encoding issues

4. **Health Check Failing**
   - Verify backend server is running
   - Check network connectivity

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Verify environment setup
4. Check server logs for errors

---

**TinyLink** - Making long URLs short and manageable! 🌐
