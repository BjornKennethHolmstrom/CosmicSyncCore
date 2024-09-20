import asyncio
import logging
from libp2p import new_host
from libp2p.peer.peerinfo import info_from_p2p_addr
from libp2p.pubsub.pubsub import Pubsub
from libp2p.pubsub.gossipsub import GossipSub
from libp2p.network.exceptions import SwarmException
from src.core.database import add_message, get_recent_messages

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class P2PNode:
    def __init__(self):
        self.host = None
        self.pubsub = None
        self.peers = set()
        self.retry_interval = 5  # seconds
        self.maintain_task = None

    async def start(self):
        try:
            self.host = await new_host()
            self.pubsub = GossipSub(self.host)
            await self.pubsub.subscribe("cosmicsynccore")
            logger.info(f"P2P node listening on {await self.host.get_addrs()}")
            self.maintain_task = self.maintain_connections()
            asyncio.create_task(self.maintain_task)
        except Exception as e:
            logger.error(f"Failed to start P2P node: {e}")
            raise

    async def stop(self):
        if self.maintain_task:
            if isinstance(self.maintain_task, asyncio.Task):
                self.maintain_task.cancel()
                try:
                    await self.maintain_task
                except asyncio.CancelledError:
                    pass
            elif asyncio.iscoroutine(self.maintain_task):
                # If it's a coroutine, we don't need to do anything
                pass
        if self.host:
            await self.host.close()
        logger.info("P2P node stopped")

    async def publish_message(self, message, user_id):
        try:
            await self.pubsub.publish("cosmicsynccore", message.encode())
            add_message(message, user_id)
            logger.info(f"Message published: {message[:20]}...")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            raise

    async def handle_message(self, message):
        try:
            decoded_message = message.data.decode()
            logger.info(f"Received message: {decoded_message[:20]}...")
            # Here you might want to add logic to store the message in the database
            # if it's not already there
        except Exception as e:
            logger.error(f"Failed to handle message: {e}")

    async def sync_messages(self, limit=100):
        try:
            local_messages = get_recent_messages(limit)
            local_message_ids = set(msg.id for msg in local_messages)
            print(f"Local message IDs: {local_message_ids}")
            
            # Fetch messages from peers
            peer_messages = []
            for peer in self.get_connected_peers():
                try:
                    peer_msgs = await self.fetch_messages_from_peer(peer, limit)
                    peer_messages.extend(peer_msgs)
                except Exception as e:
                    logger.warning(f"Failed to fetch messages from peer {peer}: {e}")
            print(f"Fetched {len(peer_messages)} messages from peers")
            
            # Deduplicate messages
            new_message_ids = set()
            new_messages = []
            for msg in peer_messages:
                if msg.id not in local_message_ids and msg.id not in new_message_ids:
                    new_messages.append(msg)
                    new_message_ids.add(msg.id)
            print(f"New messages: {len(new_messages)}")
            
            # Sort new messages by timestamp
            new_messages.sort(key=lambda x: x.timestamp)
            
            # Add new messages to the local database
            for msg in new_messages:
                add_message(msg.content, msg.user_id)
            
            # Publish new messages to the network
            for msg in new_messages:
                await self.publish_message(msg.content, msg.user_id)
            
            logger.info(f"Synced {len(new_messages)} new messages")
            return len(new_messages)
        except Exception as e:
            logger.error(f"Failed to sync messages: {e}")
            return 0

    async def fetch_messages_from_peer(self, peer, limit):
        # This method should be implemented to fetch messages from a specific peer
        # For now, we'll return an empty list
        return []

    async def connect_to_peer(self, peer_addr):
        try:
            peer_info = info_from_p2p_addr(peer_addr)
            await self.host.connect(peer_info)
            self.peers.add(peer_addr)
            logger.info(f"Connected to peer: {peer_addr}")
        except SwarmException as e:
            logger.warning(f"Failed to connect to peer {peer_addr}: {e}")

    async def maintain_connections(self):
        while True:
            disconnected_peers = set()
            for peer in self.peers:
                if not self.host.get_network().is_connected(peer):
                    disconnected_peers.add(peer)
            
            for peer in disconnected_peers:
                self.peers.remove(peer)
                asyncio.create_task(self.connect_to_peer(peer))
            
            await asyncio.sleep(self.retry_interval)

    async def add_peer(self, peer_addr):
        if peer_addr not in self.peers:
            await self.connect_to_peer(peer_addr)

    def get_connected_peers(self):
        return [peer for peer in self.peers if self.host.get_network().is_connected(peer)]

async def run_node():
    node = P2PNode()
    await node.start()

    def message_handler(message):
        asyncio.create_task(node.handle_message(message))

    node.pubsub.subscribe("cosmicsynccore", message_handler)

    try:
        while True:
            message = await asyncio.get_event_loop().run_in_executor(None, input, "Enter a message to publish: ")
            await node.publish_message(message, 0)  # Assuming user_id 0 for this example
    finally:
        await node.stop()

if __name__ == "__main__":
    asyncio.run(run_node())
