import pytest

@pytest.fixture(scope="session", autouse=True)
def enable_tracemalloc():
    import tracemalloc
    tracemalloc.start()
    yield
    tracemalloc.stop()
