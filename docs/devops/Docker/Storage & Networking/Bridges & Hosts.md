## Docker Network Drivers: Bridge, Host, None, and Overlay

Docker provides multiple **network drivers** that control how containers communicate with each other, the host, and external networks. Each driver serves different use cases based on isolation, performance, and multi-host requirements. [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

---

## 1. Bridge Network (Default)

### What Is Bridge?

The **bridge network** is the default network driver for standalone containers. It creates a private virtual network on the Docker host, connecting containers via a virtual bridge (`docker0` by default). [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### How It Works

- Containers get **private IP addresses** from a subnet (e.g., `172.17.0.0/16`)
- All containers on the same bridge can communicate via container names or IPs
- External access requires **port mapping** (`-p 8080:80`)
- Network isolation via **NAT (Network Address Translation)** [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Key Characteristics

- ✅ **Isolated**: Containers are isolated from the host network
- ✅ **Container-to-container**: Easy communication between containers on the same host
- ✅ **Port mapping**: Can expose container ports to the outside world
- ⚠️ **Single-host only**: Cannot span multiple Docker hosts [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)
- ⚠️ **Default bridge lacks DNS**: Containers communicate via IP, not names (unless using custom bridge networks) [youtube](https://www.youtube.com/watch?v=FNm5IN4-wVw)

### When to Use

- **Single-host applications** with multiple containers (e.g., web + database)
- **Development environments** where isolation is needed
- **Default choice** for most standalone containers [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Commands

```bash
# List all networks (shows default 'bridge')
docker network ls

# Create a custom bridge network (enables DNS by name)
docker network create my-bridge-network

# Run containers on custom bridge
docker run -d --name web --network my-bridge-network nginx
docker run -d --name db --network my-bridge-network postgres

# Containers can now communicate by name:
# web -> db:5432 (no need for IP addresses)
```

---

## 2. Host Network

### What Is Host?

The **host network** removes network isolation between the container and the Docker host. The container shares the host's network stack directly, using the host's IP address and port space. [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### How It Works

- Container has **no network namespace isolation**
- Uses the **host's IP address** directly (no NAT)
- No port mapping needed—container binds to host ports directly
- Faster performance (no network translation overhead) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Key Characteristics

- ✅ **No NAT**: Direct access to host network, faster performance [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)
- ✅ **Simple port management**: No `-p` flag needed
- ⚠️ **No isolation**: Container can access all host network interfaces
- ❌ **Port conflicts**: Cannot run multiple containers on the same port
- ❌ **Linux-only**: Not available on Docker Desktop for Mac/Windows [docs.docker](https://docs.docker.com/engine/network/drivers/)

### When to Use

- **High-performance applications** where network overhead matters
- **Network monitoring tools** that need direct host access
- **Legacy applications** that require specific network configurations
- **Testing/debugging** network behavior [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Commands

```bash
# Run container with host network
docker run -d --network host nginx

# No port mapping needed - nginx binds directly to host:80
# Check with: curl http://localhost:80

# Cannot run another container on port 80 (conflict!)
# docker run -d --network host apache  # Fails: port 80 already in use
```

---

## 3. None Network

### What Is None?

The **none network** completely disables networking for the container. It creates a container with only a localhost loopback interface (`lo`), isolated from all external networks. [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### How It Works

- Container gets **no network interfaces** except `lo` (loopback)
- No connectivity to host, other containers, or external networks
- Application runs in a completely **network-isolated** environment [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Key Characteristics

- ✅ **Maximum isolation**: No network access whatsoever [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)
- ✅ **Security**: Prevents data exfiltration or network-based attacks
- ✅ **Testing**: Can test application behavior without network dependencies
- ❌ **No network access**: Cannot make HTTP requests, ping, or communicate
- ❌ **Not for Swarm**: Not available for Docker Swarm services [docs.docker](https://docs.docker.com/engine/network/drivers/)

### When to Use

- **Security-sensitive workloads** that shouldn't communicate externally
- **Offline processing** (e.g., data transformation, batch jobs)
- **Testing** network-independent behavior
- **Compliance** requirements (containers that must not access networks) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Commands

```bash
# Run container with no network
docker run -d --network none alpine

# Inside the container:
# - ifconfig or ip addr shows only 'lo' (127.0.0.1)
# - ping google.com fails
# - No internet access
```

---

## 4. Overlay Network

### What Is Overlay?

The **overlay network** creates a distributed network across **multiple Docker hosts**, enabling containers on different machines to communicate as if they were on the same network. It's the foundation for **Docker Swarm** clustering. [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### How It Works

- Uses **VXLAN tunneling** to encapsulate traffic between hosts
- Containers get IPs from a shared subnet across all nodes
- Supports **service discovery** and **load balancing** in Swarm mode
- Encrypts inter-node traffic (optional) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Key Characteristics

- ✅ **Multi-host**: Containers on different hosts can communicate
- ✅ **Swarm integration**: Required for Docker Swarm services
- ✅ **Service discovery**: Built-in DNS for services by name
- ✅ **Load balancing**: Swarm routes traffic to healthy replicas
- ⚠️ **Requires Swarm**: Must initialize Docker Swarm first
- ⚠️ **Complexity**: More configuration than single-host networks [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### When to Use

- **Docker Swarm clusters** with multiple nodes
- **Microservices** distributed across multiple hosts
- **Production deployments** requiring high availability and scaling
- **Multi-host applications** (e.g., Kafka, distributed databases) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

### Commands

```bash
# Initialize Docker Swarm (required for overlay)
docker swarm init

# Create an overlay network
docker network create --driver overlay my-overlay-network

# Deploy a service on the overlay network
docker service create --name web --network my-overlay-network nginx

# Containers on different hosts can now communicate:
# web.instances on host-A <-> api.instances on host-B
```

---

## Comparison Table

| Feature                   | Bridge                     | Host                      | None                    | Overlay                                                                                                                                                 |
| ------------------------- | -------------------------- | ------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Network Isolation**     | ✅ Yes (private network)   | ❌ No (shares host)       | ✅✅ Complete isolation | ✅ Yes (encrypted tunnels) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)      |
| **Multi-Host Support**    | ❌ Single host only        | ❌ Single host only       | ❌ Single host only     | ✅ Yes (multiple hosts) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)         |
| **Port Mapping**          | ✅ Required (`-p 8080:80`) | ❌ Not needed (direct)    | ❌ Not applicable       | ✅ Via Swarm load balancer [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)      |
| **Performance**           | Good (NAT overhead)        | ⚡ Best (no NAT)          | N/A (no network)        | Good (VXLAN overhead) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)           |
| **DNS/Service Discovery** | ✅ Custom bridge only      | ❌ No                     | ❌ No                   | ✅ Yes (Swarm DNS) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)              |
| **Swarm Support**         | ❌ No                      | ❌ No                     | ❌ No                   | ✅ Yes (required) [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)               |
| **Use Case**              | Single-host apps, dev      | High-performance, testing | Security, isolation     | Multi-host, production clusters [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5) |

---

## Decision Guide: Which Network to Use?

### Single-Host Scenarios

- **Default (web + database on one machine)** → Use **Bridge** (default)
- **High-performance, trust the container** → Use **Host**
- **Security-critical, no network needed** → Use **None**

### Multi-Host Scenarios

- **Docker Swarm cluster** → Use **Overlay** (required for Swarm)
- **Kubernetes** → Use **CNI plugins** (not overlay, use Calico, Flannel, etc.)

### For Your Stack

Given your work with **Kubernetes** and **.NET Core / Python microservices**:

- **Local development**: Use **bridge networks** for container-to-container communication (`docker-compose up`)
- **Kubernetes**: Overlay is not used—Kubernetes uses **CNI** (Container Network Interface) like Calico, Flannel, or Azure CNI
- **Docker Swarm alternative**: If you ever use Swarm, overlay enables multi-node communication
- **Isolated batch jobs**: Use **none** network for security-sensitive data processing

---

## Quick Reference Commands

```bash
# List all networks
docker network ls

# Inspect network details
docker network inspect bridge

# Create custom networks
docker network create --driver bridge my-bridge
docker network create --driver overlay my-overlay
docker network create --driver none my-none

# Run containers with different networks
docker run -d --network bridge nginx
docker run -d --network host nginx
docker run -d --network none alpine
docker run -d --network my-overlay nginx

# Connect/disconnect existing containers
docker network connect my-network container-name
docker network disconnect my-network container-name
```

---

## Summary

- **Bridge**: Default for single-host apps, isolated networking with port mapping
- **Host**: Maximum performance, no isolation, shares host network directly
- **None**: Complete network isolation for security or offline workloads
- **Overlay**: Multi-host networking for Docker Swarm clusters [dev](https://dev.to/abhay_yt_52a8e72b213be229/mastering-docker-networking-bridge-host-none-and-overlay-explained-25n5)

Choose **bridge** for most development and single-host scenarios, **host** for performance-critical workloads you trust, **none** for maximum security, and **overlay** when you need containers across multiple hosts to communicate in a Swarm cluster. [docs.docker](https://docs.docker.com/engine/network/drivers/)
