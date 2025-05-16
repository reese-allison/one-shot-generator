from litestar import Litestar, post
from litestar.config.cors import CORSConfig
from litestar.status_codes import HTTP_200_OK
from pydantic import BaseModel


# --- Data Models ---
class PromptRequest(BaseModel):
    """
    Request model for oneshot generation.

    Attributes:
        prompt: The user's input prompt for generating a oneshot adventure.
    """

    prompt: str


class OneshotResponse(BaseModel):
    """
    Response model for generated oneshot adventure.

    Attributes:
        idea: The main concept for the oneshot adventure.
        details: Expanded description of the adventure.
        characters_involved: List of character archetypes or NPCs for the adventure.
    """

    idea: str
    details: str
    characters_involved: list[str]


# --- Route Handler ---
@post("/api/generate-oneshot", status_code=HTTP_200_OK)
async def generate_oneshot_idea(data: PromptRequest) -> OneshotResponse:
    """
    Generates a tabletop RPG oneshot adventure idea based on user prompt.

    Args:
        data: The PromptRequest containing the user's input prompt.

    Returns:
        OneshotResponse: A structured response containing the generated
                         adventure details.
    """
    print(f"Received prompt: {data.prompt}")

    # Placeholder logic - replace with actual generation
    generated_idea: str = f"A thrilling adventure based on: '{data.prompt}'"
    generated_details: str = (
        "The adventurers must delve into a mysterious "
        f"{data.prompt.split(' ')[-1] if data.prompt else 'depths'} "
        "to recover a lost artifact. They will face cunning traps, "
        "enigmatic puzzles, and a fearsome guardian."
    )
    characters: list[str] = ["A grizzled warrior", "A nimble rogue", "A wise mage"]

    return OneshotResponse(
        idea=generated_idea, details=generated_details, characters_involved=characters
    )


# --- Application Setup ---
# Create CORS configuration
cors_config: CORSConfig = CORSConfig(
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pass the cors_config to the Litestar constructor
app: Litestar = Litestar(
    route_handlers=[generate_oneshot_idea],
    cors_config=cors_config,  # Use cors_config here instead of middleware
)
