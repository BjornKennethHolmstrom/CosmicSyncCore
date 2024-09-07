import asyncio
from src.api.endpoints import app, p2p_node, init_p2p_node
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="google.protobuf.runtime_version")

async def periodic_sync():
    while True:
        await p2p_node.sync_messages()
        await asyncio.sleep(300)  # Sync every 5 minutes

if __name__ == '__main__':
    init_p2p_node()
    loop = asyncio.get_event_loop()
    loop.create_task(periodic_sync())
    app.run(debug=True, use_reloader=False)
