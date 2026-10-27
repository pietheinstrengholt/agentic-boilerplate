"""Write the API contract used by the generated TypeScript client."""

import json
from pathlib import Path

from app.main import app

# Keep the schema beside the server so the client has one source of truth.
Path("openapi.json").write_text(json.dumps(app.openapi(), indent=2) + "\n")
