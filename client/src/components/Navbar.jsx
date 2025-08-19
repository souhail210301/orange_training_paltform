import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Not authenticated.');
          return;
        }

        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          console.error(data.message || 'Failed to fetch user data.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Fallback user data
        setUser({
          name: 'User',
          email: 'user@example.com'
        });
      }
    };

    fetchUserData();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.container}>
          <div style={styles.navContent}>
            
            {/* Left Section: Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/certif_logo.png" alt="Certif Logo" style={{ height: '40px', marginRight: '10px' }} />
              <span style={{ color: '#F16E00', fontSize: '20px', fontWeight: 'bold' }}></span>
            </div>

            {/* Middle Section: Search Bar */}
            <div style={styles.searchSection}>
              <div style={styles.searchContainer}>
                <svg style={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  style={styles.searchInput}
                />
              </div>
            </div>

            {/* Right Section: Notifications and User Profile */}
            <div style={styles.rightSection}>
              
              {/* Notifications */}
              <div style={styles.notificationContainer}>
                <button style={styles.notificationButton}>
                  <svg style={styles.bellIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span style={styles.notificationBadge}>3</span>
                </button>
              </div>

              {/* User Profile Dropdown */}
              <div style={styles.userSection}>
                <button
                  onClick={toggleDropdown}
                  style={styles.userButton}
                >
                  <div style={styles.userAvatar}>
                    <svg style={styles.userIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div style={styles.userInfo}>
                    <p style={styles.userName}>
                      {user?.name || 'Utilisateur'}
                    </p>
                    <p style={styles.userRole}>Admin</p>
                  </div>
                  <svg style={styles.chevronIcon} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <div style={styles.dropdownContent}>
                      <button style={styles.dropdownItem}>
                        Mon Profil
                      </button>
                      <button style={styles.dropdownItem}>
                        Paramètres
                      </button>
                      <hr style={styles.dropdownDivider} />
                      <button style={styles.dropdownItem}>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

const styles = {
  navbar: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
  },
  searchSection: {
    flex: '1',
    maxWidth: '400px',
    margin: '0 32px',
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'background-color 0.2s, color 0.2s',
  },
  bellIcon: {
    width: '24px',
    height: '24px',
  },
  notificationBadge: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '16px',
    height: '16px',
    backgroundColor: '#f97316',
    color: 'white',
    fontSize: '10px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  userSection: {
    position: 'relative',
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    backgroundColor: '#f97316',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIcon: {
    width: '20px',
    height: '20px',
    color: 'white',
  },
  userInfo: {
    textAlign: 'left',
    display: 'none', // Hidden on small screens
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    margin: '0',
  },
  userRole: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0',
  },
  chevronIcon: {
    width: '16px',
    height: '16px',
    color: '#9ca3af',
  },
  dropdownMenu: {
    position: 'absolute',
    right: '0',
    top: '100%',
    marginTop: '8px',
    width: '192px',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    zIndex: '50',
  },
  dropdownContent: {
    padding: '4px 0',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 16px',
    fontSize: '14px',
    color: '#374151',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  dropdownDivider: {
    margin: '4px 0',
    border: 'none',
    borderTop: '1px solid #e5e7eb',
  },
};

// Add hover effects using CSS-in-JS
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    .navbar-search-input:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 1px #f97316 !important;
    }
    .navbar-notification-button:hover {
      background-color: #f3f4f6 !important;
      color: #111827 !important;
    }
    .navbar-user-button:hover {
      background-color: #f3f4f6 !important;
    }
    .navbar-dropdown-item:hover {
      background-color: #f3f4f6 !important;
    }
    @media (min-width: 768px) {
      .navbar-user-info {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(style);
};

// Apply hover effects when component mounts
if (typeof document !== 'undefined') {
  addHoverEffects();
}

export default Navbar;