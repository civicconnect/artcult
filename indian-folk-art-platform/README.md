# Kala Sanskriti - Indian Folk Art Heritage Platform

![Kala Sanskriti Logo](public/images/logo.svg)

**कला संस्कृति** - A digital platform dedicated to preserving, promoting, and celebrating traditional Indian folk art forms like Warli, Madhubani, Pithora, and Kalamkari.

## 🎨 Overview

Kala Sanskriti is a comprehensive web platform that bridges the gap between traditional Indian folk artists and modern audiences. Our mission is to preserve centuries-old art forms while providing sustainable livelihoods for local artisans through digital innovation.

### ✨ Key Features

- **Artist Discovery**: Find and connect with master folk artists across India
- **Regional Exploration**: Discover art forms by geographical regions
- **Interactive Learning**: Book sessions with artists for hands-on learning
- **Artisan Marketplace**: Direct-to-consumer sales platform for authentic folk art
- **Cultural Preservation**: Digital documentation of traditional techniques
- **Community Building**: Connect art enthusiasts and preserve cultural heritage

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database for storing user, artist, and product data
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - Interactive functionality
- **Font Awesome** - Icon library
- **Google Fonts** - Typography (Poppins, Crimson Text, Kalam)

### Security & Performance
- **Helmet.js** - Security headers
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Data sanitization
- **Responsive Design** - Mobile-first approach

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd indian-folk-art-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/indian_folk_art
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # For local MongoDB installation
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will be running with all features enabled

## 📁 Project Structure

```
indian-folk-art-platform/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Artist.js            # Artist profile schema
│   ├── Product.js           # Marketplace product schema
│   └── Session.js           # Booking session schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── artists.js           # Artist-related routes
│   ├── products.js          # Marketplace routes
│   └── sessions.js          # Session booking routes
├── public/
│   ├── css/
│   │   ├── style.css        # Main styles
│   │   ├── components.css   # Component styles
│   │   └── animations.css   # Animation definitions
│   ├── js/
│   │   ├── main.js          # Core application logic
│   │   ├── auth.js          # Authentication handling
│   │   └── api.js           # API client utilities
│   ├── images/
│   │   └── logo.svg         # Platform logo
│   └── assets/              # Additional static assets
├── views/
│   └── index.html           # Main application view
├── uploads/                 # File upload directory
├── .env                     # Environment variables
├── server.js                # Application entry point
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## 🎯 Core Features

### 1. User Authentication & Profiles
- **Secure Registration/Login**: JWT-based authentication
- **Role-based Access**: Users, Artists, and Administrators
- **Profile Management**: Customizable user profiles with preferences

### 2. Artist Discovery & Profiles
- **Comprehensive Profiles**: Artist bios, specializations, portfolios
- **Geographic Search**: Find artists by state, city, or region
- **Skill-based Filtering**: Search by art form and category
- **Rating System**: Community-driven artist ratings

### 3. Interactive Learning Platform
- **Session Booking**: Schedule one-on-one or group sessions
- **Multiple Formats**: Online, in-person, and hybrid sessions
- **Flexible Scheduling**: Artist availability management
- **Session Management**: Status tracking and updates

### 4. Artisan Marketplace
- **Direct Sales**: Artists sell directly to customers
- **Product Catalog**: Detailed product listings with images
- **Category Organization**: Browse by art form or product type
- **Secure Transactions**: Integrated payment processing

### 5. Cultural Preservation
- **Digital Documentation**: Preserve traditional techniques
- **Educational Content**: Learn about different art forms
- **Cultural Context**: Historical and regional information
- **Community Stories**: Artist interviews and backgrounds

## 🎨 Design Philosophy

### Indian Traditional Aesthetics + Gen-Z Modern Touch

- **Color Palette**: Saffron, indigo, vermillion, and earth tones
- **Typography**: Mix of modern sans-serif and traditional serif fonts
- **Animations**: Smooth, engaging interactions with cultural motifs
- **Responsive Design**: Mobile-first approach for accessibility
- **Accessibility**: WCAG 2.1 compliant design principles

### User Experience Principles
- **Intuitive Navigation**: Clear information architecture
- **Visual Hierarchy**: Prominent calls-to-action and content flow
- **Performance Optimized**: Fast loading times and smooth interactions
- **Cross-platform Compatibility**: Works on all modern browsers and devices

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update user profile
```

### Artists
```
GET    /api/artists                    # Get all artists (with filtering)
GET    /api/artists/:id                # Get specific artist
POST   /api/artists                    # Create artist profile
PUT    /api/artists/:id                # Update artist profile
POST   /api/artists/:id/portfolio      # Add portfolio item
GET    /api/artists/location/:state    # Get artists by location
GET    /api/artists/search/:artform/:category # Search artists
```

### Products
```
GET    /api/products                   # Get all products (with filtering)
GET    /api/products/:id               # Get specific product
POST   /api/products                   # Create product
PUT    /api/products/:id               # Update product
DELETE /api/products/:id               # Delete product
GET    /api/products/featured/list     # Get featured products
GET    /api/products/category/:category # Get products by category
```

### Sessions
```
GET  /api/sessions           # Get user's sessions
GET  /api/sessions/:id       # Get specific session
POST /api/sessions           # Book a session
PUT  /api/sessions/:id/status # Update session status
PUT  /api/sessions/:id/rate   # Rate a session
```

## 🌟 Art Forms Supported

### Traditional Indian Folk Art Forms
- **Warli Art** - Maharashtra tribal art with geometric patterns
- **Madhubani** - Bihar's vibrant mythological paintings
- **Pithora** - Gujarat's ceremonial wall paintings
- **Kalamkari** - Andhra Pradesh's hand-painted textiles
- **Gond Art** - Madhya Pradesh's nature-inspired art
- **Tanjore Paintings** - Tamil Nadu's gold-embellished art
- **And many more...**

### Categories
- 🎵 **Folk Music** - Traditional songs and instruments
- 💃 **Folk Dance** - Classical and regional dance forms
- 🎨 **Painting & Art** - Visual arts and paintings
- 🏺 **Handicrafts** - Pottery, weaving, and crafts
- 🧵 **Textiles** - Traditional fabrics and embroidery
- 🗿 **Sculpture** - Stone, wood, and metal work

## 🚀 Deployment

### Local Development
```bash
npm run dev    # Start with nodemon for development
```

### Production Deployment
```bash
npm start      # Start production server
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=3000
```

## 🤝 Contributing

We welcome contributions from developers, designers, and cultural enthusiasts!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Respect cultural sensitivities in content and design

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Traditional folk artists who preserve India's cultural heritage
- Cultural institutions supporting folk art documentation
- Open source community for tools and libraries
- Contributors and supporters of the project

## 📞 Contact & Support

- **Email**: support@kalasanskriti.com
- **Website**: https://kalasanskriti.com
- **Issues**: GitHub Issues page
- **Discussions**: GitHub Discussions

---

**Made with ❤️ for preserving India's rich cultural heritage**

*Kala Sanskriti - Where tradition meets innovation*