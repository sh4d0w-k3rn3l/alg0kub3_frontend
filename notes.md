<!-- Steps  -->
1. Create a DO Droplet
2. Install Docker on it
3. Pre-pull all the docker images
4. Install python deps (fastapi, uvicorn, docker, httpx)
5. Run sandbox_server.py

<!-- Railway ENV -->
SANDBOX_SERVER_URL=http://<droplet-ip>:8000
SANDBOX_API_KEY:<your-hex-key>

Then in the admin panel -> Code Execution Settings -> switch provider to "Docker Sandbox (DO)" -> enter the same URL and API KEY -> click Test -> if green, it's live.


