"""The backing services this application is configured to reach.

Each entry maps a service to the environment variable that addresses it. The
queue's variable comes from docker-compose.yml through .env.example. The
others -- file storage, the AI provider, Google SSO -- are deployment secrets
the product owner adds before deployment (see the project's service-keys
list); they are intentionally absent from docker-compose and read here only
to report whether they have been set, never their value.
"""

import os

SERVICES = {
    "redis-queue": "REDIS_URL",
    "file-storage": "S3_BUCKET",
    "ai-provider": "OPENAI_API_KEY",
    "auth": "GOOGLE_CLIENT_ID",
}


def configured_services() -> dict[str, bool]:
    """Each service mapped to whether its connection variable is set."""
    return {name: bool(os.getenv(var)) for name, var in SERVICES.items()}
