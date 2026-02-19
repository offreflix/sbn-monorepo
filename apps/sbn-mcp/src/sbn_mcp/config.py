import os
from dotenv import load_dotenv

load_dotenv()

SBN_API_KEY = os.environ.get("SBN_API_KEY", "")
SBN_API_BASE_URL = os.environ.get("SBN_API_BASE_URL", "http://localhost:56080")
