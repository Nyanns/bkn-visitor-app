import socket
import logging
import os
from datetime import datetime
from colorama import init, Fore, Style
import threading

# Configuration
TRAP_PORT = 8888
LOG_DIR = "logs"
LOG_FILE = os.path.join(LOG_DIR, "honeyport.log")

# Setup Logging
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s | ALERT | Suspected Intruder detected from %(message)s'
)

init(autoreset=True)

def handle_client(client_socket, addr):
    ip = addr[0]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    alert_msg = f"HONEYPORT TRIGGERED! IP: {ip} tried to connect to port {TRAP_PORT} at {timestamp}"
    
    print(f"\n{Fore.RED}{Style.BRIGHT}[!] {alert_msg}")
    print(f"{Fore.YELLOW}Logging intrusion and terminating connection...{Style.RESET_ALL}")
    
    logging.info(f"{ip}:{addr[1]}")
    
    # Optional: Send a fake banner to confuse them before closing
    try:
        client_socket.send(b"Access Denied. Your IP has been logged.\n")
    except:
        pass
        
    client_socket.close()

def start_honeyport():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(('0.0.0.0', TRAP_PORT))
    server.listen(5)
    
    print(f"{Fore.GREEN}{Style.BRIGHT}[*] Honeyport Active. Listening on port {TRAP_PORT}...")
    print(f"{Fore.CYAN}[*] Traps set. Waiting for intruders...{Style.RESET_ALL}")
    
    try:
        while True:
            client, addr = server.accept()
            # Handle in a thread to not block the main loop, though for a honeyport blocking is fine too.
            client_handler = threading.Thread(target=handle_client, args=(client, addr))
            client_handler.start()
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}[*] Shutting down Honeyport.")
        server.close()
    except Exception as e:
        print(f"\n{Fore.RED}[!] Error: {e}")
        server.close()

if __name__ == "__main__":
    start_honeyport()
