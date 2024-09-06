import asyncio
from libp2p import new_host
from libp2p.peer.peerinfo import info_from_p2p_addr
from libp2p.typing import StreamHandler

class P2PNode:
    def __init__(self):
        self.host = None

    async def start(self):
        self.host = await new_host()
        print(f"P2P node listening on {self.host.get_addrs()}")

    async def connect_to_peer(self, addr):
        info = info_from_p2p_addr(addr)
        await self.host.connect(info)
        print(f"Connected to peer: {addr}")

    def set_stream_handler(self, protocol: str, stream_handler: StreamHandler):
        self.host.set_stream_handler(protocol, stream_handler)

async def handle_echo(stream):
    while True:
        read_bytes = await stream.read(1024)
        if read_bytes is None:
            break
        await stream.write(read_bytes)

async def main():
    node = P2PNode()
    await node.start()
    node.set_stream_handler("/echo/1.0.0", handle_echo)

    # Keep the program running
    while True:
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
