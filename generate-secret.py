#!/usr/bin/env python3
import secrets

# Generate a secure random secret
secret = secrets.token_hex(32)
print(f"Generated session secret: {secret}")
print("\nAdd this to your .env file:")
print(f"SESSION_SECRET={secret}")