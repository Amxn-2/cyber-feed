#!/usr/bin/env python3
"""
Environment setup script for Python scraper
"""

import os
import shutil
from pathlib import Path

def setup_environment():
    """Set up environment file from sample"""
    env_sample = Path("env.sample")
    env_file = Path(".env")
    
    if not env_sample.exists():
        print("❌ env.sample file not found!")
        return False
    
    if env_file.exists():
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ").strip().lower()
        if response != 'y':
            print("✅ Keeping existing .env file")
            return True
    
    try:
        shutil.copy(env_sample, env_file)
        print("✅ Created .env file from env.sample")
        print("📝 Please edit .env file with your actual values:")
        print("   - MONGODB_URI: Your MongoDB connection string")
        print("   - CORS_ORIGINS: Your frontend URLs")
        print("   - Other configuration values as needed")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def test_configuration():
    """Test if configuration loads correctly"""
    try:
        from config import Config
        print("✅ Configuration loaded successfully!")
        print(f"   Port: {Config.PORT}")
        print(f"   Host: {Config.HOST}")
        print(f"   Database: {Config.get_database_name()}")
        print(f"   Collection: {Config.get_collection_name()}")
        print(f"   CORS Origins: {Config.get_cors_origins()}")
        print(f"   India Only: {Config.INDIA_ONLY}")
        return True
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Python Scraper Environment Setup")
    print("=" * 40)
    
    # Setup environment file
    if not setup_environment():
        return
    
    print("\n🧪 Testing configuration...")
    if test_configuration():
        print("\n✅ Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Edit .env file with your actual values")
        print("2. Run: python main.py")
        print("3. Test endpoints: http://localhost:5000/health")
    else:
        print("\n❌ Setup failed. Please check your configuration.")

if __name__ == "__main__":
    main()