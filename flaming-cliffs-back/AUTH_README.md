# JWT Authentication API Documentation

## Authentication Endpoints

Your Flaming Cliffs API now includes JWT-based authentication with the following endpoints:

### 1. Register a New User
**POST** `/api/auth/register`

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "USER" // Optional: "USER" or "ADMIN"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2025-09-08T09:48:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User
**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Refresh Access Token
**POST** `/api/auth/refresh`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get Current User Profile
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2025-09-08T09:48:00.000Z",
    "updatedAt": "2025-09-08T09:48:00.000Z"
  }
}
```

### 5. Logout User
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

## Protected Endpoints

### Get All Users (Admin Only)
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Note:** Only users with `ADMIN` role can access this endpoint.

### Create User (Admin Only)
**POST** `/api/users`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "password123",
  "role": "USER"
}
```

## Token Information

- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days
- **Security**: Tokens are stored in the database and invalidated on logout

## Example Usage with JavaScript/Fetch

```javascript
// Register
const register = async () => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  if (data.tokens) {
    localStorage.setItem('accessToken', data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.tokens.refreshToken);
  }
};

// Login
const login = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  if (data.tokens) {
    localStorage.setItem('accessToken', data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.tokens.refreshToken);
  }
};

// Make authenticated request
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshToken();
    // Retry request...
  }
  
  return response.json();
};

// Refresh token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  if (data.tokens) {
    localStorage.setItem('accessToken', data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.tokens.refreshToken);
  }
};

// Logout
const logout = async () => {
  const token = localStorage.getItem('accessToken');
  
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

## Testing the API

You can test the API using:

1. **Swagger UI**: Visit `http://localhost:3000/api-docs`
2. **Postman**: Import the endpoints and test them
3. **cURL**: Use command line to test

### Example cURL Commands

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Get profile (replace TOKEN with actual access token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Environment Variables

Make sure to set strong JWT secrets in production:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-256-bit-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-256-bit-key
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Token blacklisting on logout
- ✅ Role-based access control
- ✅ Input validation
- ✅ Error handling
- ✅ Swagger documentation with security
