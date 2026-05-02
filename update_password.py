from sqlalchemy import create_engine, text
import bcrypt

# Connect to AUTH_DB
engine_auth = create_engine('mssql+pyodbc://quang:123456@localhost\\SQLEXPRESS/AUTH_DB?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes')

# First, check if admin user exists
with engine_auth.connect() as conn:
    user = conn.execute(text('SELECT UserID, Username FROM Users WHERE Username = :u'), {'u': 'admin'}).fetchone()
    if user:
        print(f"Found user: {user.Username} (ID: {user.UserID})")
        
        # Generate new hash for '123456'
        new_hash = bcrypt.hashpw('123456'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        print(f"New hash: {new_hash}")
        
        # Update the password hash
        conn.execute(text('UPDATE Users SET PasswordHash = :h WHERE Username = :u'), {'h': new_hash, 'u': 'admin'})
        conn.commit()
        print("Password hash updated!")
        
        # Verify the update
        user = conn.execute(text('SELECT PasswordHash FROM Users WHERE Username = :u'), {'u': 'admin'}).fetchone()
        stored_hash = user.PasswordHash
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode('utf-8')
        print(f"Password '123456' matches: {bcrypt.checkpw('123456'.encode('utf-8'), stored_hash)}")
    else:
        print("User 'admin' not found in database!")