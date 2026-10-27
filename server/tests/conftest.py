"""Keep API tests independent of local application secrets."""

import os

os.environ["APP_ENV"] = "test"
