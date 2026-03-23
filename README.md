# 1. Get the code
git clone https://github.com/SuchinthaHettiarachchi/Learn-Hub.git
cd Learn-Hub

# 2. Setup Backend & MongoDB
cd server
npm install

# --- MONGODB PART START ---
# A. Create a free cluster at mongodb.com
# B. Set Network Access to "Allow Access From Anywhere" (0.0.0.0/0)
# C. Copy your Connection String (Driver: Node.js)
# D. Create the environment file:
touch .env 
# E. Open .env and add: MONGODB_URI=your_copied_string_here
# --- MONGODB PART END ---

# 3. Setup Frontend
cd ../client
npm install

# 4. Run the Project
# Terminal 1 (in /server): npm run dev
# Terminal 2 (in /client): npm run dev