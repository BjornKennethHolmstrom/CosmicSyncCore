import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from src.core.p2p import P2PNode
from src.core.database import Message

@pytest.mark.asyncio
@patch('src.core.p2p.get_recent_messages')
@patch('src.core.p2p.add_message')
async def test_sync_messages_successful(mock_add_message, mock_get_recent_messages):
    node = P2PNode()
    node.get_connected_peers = MagicMock(return_value=['peer1', 'peer2'])
    
    # Create a side_effect that returns different messages for each peer
    async def fetch_messages_side_effect(peer, limit):
        if peer == 'peer1':
            return [
                Message(id=1, content='msg1', user_id=1, timestamp='2021-01-01'),
                Message(id=2, content='msg2', user_id=2, timestamp='2021-01-02')
            ]
        elif peer == 'peer2':
            return [
                Message(id=2, content='msg2', user_id=2, timestamp='2021-01-02'),
                Message(id=3, content='msg3', user_id=3, timestamp='2021-01-03')
            ]
    
    node.fetch_messages_from_peer = AsyncMock(side_effect=fetch_messages_side_effect)
    node.publish_message = AsyncMock()

    mock_get_recent_messages.return_value = [
        Message(id=3, content='msg3', user_id=3, timestamp='2021-01-03')
    ]

    result = await node.sync_messages()
    print(f"Result from sync_messages: {result}")

    assert result == 2  # We expect 2 new messages (id 1 and 2)
    assert mock_add_message.call_count == 2
    assert node.publish_message.call_count == 2

@pytest.mark.asyncio
@patch('src.core.p2p.get_recent_messages')
@patch('src.core.p2p.add_message')
async def test_sync_messages_no_new_messages(mock_add_message, mock_get_recent_messages):
    node = P2PNode()
    node.get_connected_peers = MagicMock(return_value=['peer1'])
    node.fetch_messages_from_peer = AsyncMock(return_value=[
        Message(id=1, content='msg1', user_id=1, timestamp='2021-01-01')
    ])
    node.publish_message = AsyncMock()

    mock_get_recent_messages.return_value = [
        Message(id=1, content='msg1', user_id=1, timestamp='2021-01-01')
    ]

    result = await node.sync_messages()

    assert result == 0
    assert mock_add_message.call_count == 0
    assert node.publish_message.call_count == 0

@pytest.mark.asyncio
@patch('src.core.p2p.get_recent_messages')
@patch('src.core.p2p.add_message')
async def test_sync_messages_error_handling(mock_add_message, mock_get_recent_messages):
    node = P2PNode()
    node.get_connected_peers = MagicMock(return_value=['peer1'])
    node.fetch_messages_from_peer = AsyncMock(side_effect=Exception('Fetch error'))
    node.publish_message = AsyncMock()

    mock_get_recent_messages.return_value = []

    result = await node.sync_messages()

    assert result == 0
    assert mock_add_message.call_count == 0
    assert node.publish_message.call_count == 0
