import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from src.core.p2p import P2PNode
from libp2p.network.exceptions import SwarmException
import logging

@pytest.fixture
def caplog(caplog):
    caplog.set_level(logging.INFO)
    return caplog

@pytest.mark.asyncio
async def test_init():
    node = P2PNode()
    assert node.host is None
    assert node.pubsub is None
    assert node.peers == set()
    assert node.retry_interval == 5

@pytest.mark.asyncio
@patch('src.core.p2p.new_host')
@patch('src.core.p2p.GossipSub')
@patch('asyncio.create_task')
async def test_start(mock_create_task, mock_gossipsub, mock_new_host):
    node = P2PNode()
    mock_host = AsyncMock()
    mock_new_host.return_value = mock_host
    mock_pubsub = AsyncMock()
    mock_gossipsub.return_value = mock_pubsub

    # Mock the get_addrs method to return a coroutine
    async def mock_get_addrs():
        return ["/ip4/127.0.0.1/tcp/8000"]
    mock_host.get_addrs.side_effect = mock_get_addrs

    # Create a coroutine for new_host
    async def mock_new_host_coro():
        return mock_host
    mock_new_host.side_effect = mock_new_host_coro

    await node.start()

    mock_new_host.assert_called_once()
    mock_gossipsub.assert_called_once_with(mock_host)
    mock_pubsub.subscribe.assert_called_once_with("cosmicsynccore")
    assert node.host == mock_host
    assert node.pubsub == mock_pubsub
    mock_create_task.assert_called_once()

    # Ensure the maintain_connections task was created
    mock_create_task.assert_called_once()
    maintain_connections_call = mock_create_task.call_args[0][0]
    assert asyncio.iscoroutine(maintain_connections_call)

@pytest.mark.asyncio
@patch('src.core.p2p.add_message')
async def test_publish_message(mock_add_message):
    node = P2PNode()
    node.pubsub = AsyncMock()
    message = "Test message"
    user_id = 1

    await node.publish_message(message, user_id)

    node.pubsub.publish.assert_called_once_with("cosmicsynccore", message.encode())
    mock_add_message.assert_called_once_with(message, user_id)

@pytest.mark.asyncio
async def test_handle_message(caplog):
    node = P2PNode()
    message = Mock()
    message.data = b"Test message"

    await node.handle_message(message)
    assert "Received message: Test message" in caplog.text

@pytest.mark.asyncio
@patch('src.core.p2p.get_recent_messages')
async def test_sync_messages(mock_get_recent_messages):
    node = P2PNode()
    mock_get_recent_messages.return_value = [
        Mock(content="Message 1", user_id=1),
        Mock(content="Message 2", user_id=2)
    ]
    node.publish_message = AsyncMock()

    await node.sync_messages()

    assert node.publish_message.call_count == 2
    node.publish_message.assert_any_call("Message 1", 1)
    node.publish_message.assert_any_call("Message 2", 2)

@pytest.mark.asyncio
@patch('src.core.p2p.info_from_p2p_addr')
async def test_connect_to_peer_success(mock_info_from_p2p_addr):
    node = P2PNode()
    mock_peer_info = Mock()
    mock_info_from_p2p_addr.return_value = mock_peer_info
    node.host = AsyncMock()
    peer_addr = "/ip4/127.0.0.1/tcp/8000/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N"

    await node.connect_to_peer(peer_addr)

    node.host.connect.assert_called_once_with(mock_peer_info)
    assert peer_addr in node.peers

@pytest.mark.asyncio
@patch('src.core.p2p.info_from_p2p_addr')
async def test_connect_to_peer_failure(mock_info_from_p2p_addr, caplog):
    node = P2PNode()
    mock_peer_info = Mock()
    mock_info_from_p2p_addr.return_value = mock_peer_info
    node.host = AsyncMock()
    node.host.connect.side_effect = SwarmException("Connection failed")
    peer_addr = "/ip4/127.0.0.1/tcp/8000/p2p/QmYyQSo1c1Ym7orWxLYvCrM2EmxFTANf8wXmmE7DWjhx5N"

    await node.connect_to_peer(peer_addr)
    assert f"Failed to connect to peer {peer_addr}" in caplog.text

@pytest.mark.asyncio
async def test_stop():
    node = P2PNode()
    node.host = AsyncMock()
    
    # Create a real coroutine for maintain_task
    async def mock_maintain_task():
        pass
    node.maintain_task = asyncio.create_task(mock_maintain_task())

    await node.stop()

    assert node.maintain_task.cancelled()
    node.host.close.assert_called_once()
