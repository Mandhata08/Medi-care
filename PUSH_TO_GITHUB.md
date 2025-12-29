# Push to GitHub - Step by Step

## Problem
Git is using cached credentials for a different GitHub account ("spaarkdating"). We need to use your account ("Mandhata08").

## Solution Options

### Option 1: Use Personal Access Token (Easiest)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens/new
   - Name: "Medi-care Push"
   - Expiration: Choose your preference (90 days recommended)
   - Scopes: Check `repo` (Full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Clear old credentials and push:**
   ```powershell
   cd "C:\Users\Mandhata Singh\Desktop\business"
   
   # Clear Windows credential manager
   cmdkey /list | Select-String "github" | ForEach-Object { cmdkey /delete:$_.Line }
   
   # Push (will prompt for credentials)
   git push -u origin main
   ```
   - Username: `Mandhata08`
   - Password: **Paste your personal access token**

### Option 2: Use SSH (More Secure)

1. **Generate SSH key** (if you don't have one):
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept defaults
   ```

2. **Copy your public key:**
   ```powershell
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```

3. **Add SSH key to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Title: "Medi-care"
   - Paste your public key
   - Click "Add SSH key"

4. **Change remote to SSH and push:**
   ```powershell
   cd "C:\Users\Mandhata Singh\Desktop\business"
   git remote set-url origin git@github.com:Mandhata08/Medi-care.git
   git push -u origin main
   ```

### Option 3: Use GitHub Desktop

1. Download: https://desktop.github.com/
2. Sign in with your GitHub account (Mandhata08)
3. File → Add Local Repository
4. Select: `C:\Users\Mandhata Singh\Desktop\business`
5. Click "Publish repository"

## Quick Fix (If you have token ready)

```powershell
cd "C:\Users\Mandhata Singh\Desktop\business"

# Update remote URL to include username (will prompt for password/token)
git remote set-url origin https://Mandhata08@github.com/Mandhata08/Medi-care.git

# Push
git push -u origin main
# When prompted, use your Personal Access Token as the password
```

## Current Status

✅ Repository initialized
✅ All files committed (152 files)
✅ Remote configured
⏳ Waiting for authentication

Once authenticated, your code will be pushed to: https://github.com/Mandhata08/Medi-care

