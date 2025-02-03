import sys
import importlib.metadata

def verify_dependencies():
    print("=== Package Versions ===")
    packages = ['aiohttp', 'fastapi', 'uvicorn']
    for pkg in packages:
        try:
            version = importlib.metadata.version(pkg)
            print(f"{pkg}: {version}")
        except importlib.metadata.PackageNotFoundError:
            print(f"{pkg}: Not found")
    
    print("\n=== aiohttp Import Test ===")
    try:
        import aiohttp
        print(f"aiohttp version: {aiohttp.__version__}")
        print("aiohttp import successful")
    except ImportError as e:
        print(f"Failed to import aiohttp: {e}")

if __name__ == "__main__":
    verify_dependencies()
