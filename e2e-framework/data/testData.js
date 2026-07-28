module.exports = {
  auth: {
    validUser: {
      email: 'testuser@meditation.com',
      password: 'Password123!'
    },
    invalidUser: {
      email: 'nonexistent@meditation.com',
      password: 'WrongPassword999!'
    },
    emptyCredentials: {
      email: '',
      password: ''
    },
    shortPasswordUser: {
      email: 'shortpass@meditation.com',
      password: '123'
    }
  },
  registration: {
    newUser: {
      name: 'Automation User',
      email: `qa_user_${Date.now()}@test.com`,
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!'
    },
    invalidEmailUser: {
      name: 'Invalid Email',
      email: 'invalid-email-format',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    },
    mismatchedPasswordUser: {
      name: 'Mismatch Pass',
      email: 'mismatch@test.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword456!'
    }
  },
  routes: {
    public: ['/', '/intro', '/login', '/signup', '/forgot-password'],
    protected: ['/home', '/profile', '/update-info', '/progress', '/session']
  }
};
