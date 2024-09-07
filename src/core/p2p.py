import asyncio
from libp2p import new_host
from libp2p.peer.peerinfo import info_from_p2p_addr
from libp2p.pubsub.pubsub import Pubsub
from libp2p.pubsub.gossipsub import GossipSub
from src.core.database import add_message, get_recent_messages

class P2PNode:
    def __init__(self):
        self.host = None
        self.pubsub = None

    async def start(self):
        self.host = await new_host()
        self.pubsub = GossipSub(self.host)
        await self.pubsub.subscribe("cosmicsynccore")
        print(f"P2P node listening on {self.host.get_addrs()}")

    async def publish_message(self, message, user_id):
        await self.pubsub.publish("cosmicsynccore", message.encode())
        add_message(message, user_id)

    async def handle_message(self, message):
        print(f"Received message: {message.data.decode()}")
        # Here you might want to add logic to store the message in the database
        # if it's not already there

    async def sync_messages(self):
        messages = get_recent_messages(100)  # Sync last 100 messages
        for msg in messages:
            await self.publish_message(msg.content, msg.user_id)

async def run_node():
    node = P2PNode()
    await node.start()

    def message_handler(message):
        asyncio.create_task(node.handle_message(message))

    node.pubsub.subscribe("cosmicsynccore", message_handler)

    while True:
        message = await asyncio.get_event_loop().run_in_executor(None, input, "Enter a message to publish: ")
        await node.publish_message(message)

if __name__ == "__main__":
    asyncio.run(run_node())
