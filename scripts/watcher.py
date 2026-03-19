import os
import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import json
from processor import process_file

class PresentationWatcher(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            self._process(event.src_path)

    def on_modified(self, event):
        if not event.is_directory:
            self._process(event.src_path)

    def _process(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.pptx', '.pdf', '.docx', '.xlsx']:
            print(f"[*] Detected new/modified file: {file_path}")
            # Wait for file to be ready
            time.sleep(1)
            try:
                process_file(file_path)
            except Exception as e:
                print(f"[!] Error processing {file_path}: {e}")

if __name__ == "__main__":
    monitored_paths = [
        os.path.expanduser("~/Presentations/"),
        os.path.expanduser("~/Legacy/"),
        os.path.join(os.getcwd(), "assets/Raw/")
    ]
    
    # Ensure paths exist
    for p in monitored_paths:
        if not os.path.exists(p):
            os.makedirs(p, exist_ok=True)

    event_handler = PresentationWatcher()
    observer = Observer()
    for path in monitored_paths:
        print(f"[*] Watching {path}")
        observer.schedule(event_handler, path, recursive=False)
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
