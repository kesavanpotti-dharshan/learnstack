---
title: Azure Virtual Machines
sidebar_position: 1
---

An **Azure Virtual Machine (Azure VM)** is an on-demand, scalable cloud server that runs Windows or Linux. You choose the VM size, operating-system image, disks, network configuration, and availability design; Azure supplies the physical infrastructure, but you remain responsible for the OS, patches, applications, security configuration, and most workload operations.[1][2]

## What an Azure VM includes

Creating a VM creates more than a server instance. A typical deployment includes:[1]

```text
Azure VM
 ├─ VM size: vCPU, RAM, local temporary disk, network capacity
 ├─ OS image: Windows Server, Ubuntu, RHEL, custom image, etc.
 ├─ OS managed disk
 ├─ Optional managed data disks
 ├─ Virtual network and subnet
 ├─ Network interface (NIC)
 ├─ Private IP address
 ├─ Optional public IP address
 ├─ Network Security Group (NSG)
 └─ Monitoring, identity, backup, and management configuration
```

The VM itself is the compute resource; disks, IP addresses, public bandwidth, backups, and licenses may have separate costs.[1]

## How it works

Azure runs your VM on physical infrastructure in an Azure region through virtualization. From your perspective, it behaves like a server:

- Connect with **SSH** for Linux or **RDP** for Windows.
- Install applications, agents, runtimes, and services.
- Configure firewall rules, updates, disks, users, and backups.
- Resize the VM or create more instances as demand changes.

Azure manages the physical hosts, power, cooling, and virtualization layer. You manage the guest operating system and workload.

```text
Your responsibility
  Application → runtime → guest OS → configuration → patches

Azure responsibility
  Hypervisor → physical servers → networking fabric → data center
```

This is Infrastructure as a Service (**IaaS**).

## VM size

A VM size determines its capacity and capabilities:

- vCPU count
- Memory
- Local temporary storage
- Network bandwidth
- Number of attachable disks/NICs
- Availability of GPUs, high-memory configurations, or local NVMe disks

Azure groups sizes into families optimized for different workloads.[3]

| Workload                             | Typical size characteristic              |
| ------------------------------------ | ---------------------------------------- |
| Small web/API server                 | General purpose, balanced CPU and memory |
| CPU-heavy batch processing           | Compute optimized                        |
| Cache or in-memory database          | Memory optimized                         |
| SQL Server / IOPS-heavy database     | Memory/storage optimized                 |
| AI, rendering, ML inference/training | GPU accelerated                          |
| High local-storage workload          | Storage optimized                        |

Choose based on measured CPU, memory, disk IOPS/throughput, and network requirements—not only on core count.

## Storage

Azure VMs normally use **managed disks** for persistent storage.[1][4]

| Storage type         | Typical use                                          |
| -------------------- | ---------------------------------------------------- |
| OS disk              | Holds the guest operating system                     |
| Data disk            | Persistent application/database data                 |
| Temporary/local disk | Scratch space, cache, page file, transient data only |
| Snapshot/image       | Point-in-time copy or reusable VM image              |

Important rules:

- Treat a VM’s local temporary disk as **ephemeral**; do not put the only copy of important data there.
- Keep important data on managed data disks, Azure Storage, or managed database services.
- Keeping application data on a separate disk from the OS disk makes recovery and migration easier.[1]

Managed disks are designed for high availability and durability; Azure documents triple replication for managed-disk data, and offers locally redundant and zone-redundant disk options.[4]

## Networking and security

Every VM needs a NIC attached to an Azure Virtual Network (**VNet**) and subnet.[1]

```text
Internet
   |
Public IP / Load Balancer / Application Gateway
   |
Network Security Group
   |
VNet → Subnet → NIC → Azure VM
```

### Network Security Groups

An **NSG** contains inbound and outbound allow/deny rules. It controls which traffic can reach a VM or subnet.[1]

Examples:

- Allow TCP 443 from the internet to a web tier.
- Allow TCP 22 for SSH only from a private management network.
- Allow TCP 1433 only from an application subnet to a SQL VM.
- Deny everything else by default.

Best practice: avoid giving production VMs public IPs unless necessary. Prefer private networking, Azure Bastion, VPN/ExpressRoute, jump hosts, or private load balancers for administrative access.

## Availability and scaling

One VM is a single-server design. If it fails, requires maintenance, or its availability zone has an outage, your workload may be unavailable.

### Availability Zones

Availability Zones are physically separate locations in an Azure region with independent power, cooling, and networking. Deploying two or more instances across zones improves resilience against a zonal failure.[1][4][5]

```text
Region
 ├─ Zone 1 → VM instance A
 ├─ Zone 2 → VM instance B
 └─ Load balancer distributes traffic
```

Azure states that deploying two or more VMs across two or more Availability Zones provides a 99.99% VM connectivity SLA for the relevant scenario.[1]

### Availability Sets

An **Availability Set** is a logical grouping that spreads VMs across fault domains and update domains to reduce the chance that host maintenance or shared infrastructure failure affects all instances simultaneously.[6]

Use availability sets mainly for older/non-zonal architectures; for new high-availability designs in regions supporting zones, multi-zone deployment is usually preferred.

### Virtual Machine Scale Sets

A **Virtual Machine Scale Set (VMSS)** manages a group of identical or nearly identical VMs. It can load balance traffic, scale instance count automatically based on demand or schedules, and centrally manage configuration and updates.[1]

```text
Load Balancer
     |
     +--> VMSS instance 1
     +--> VMSS instance 2
     +--> VMSS instance 3
```

Use VMSS for stateless web/API workers, batch processors, and other horizontally scalable services.

## Management options

You can create and manage VMs through:

- Azure portal
- Azure CLI
- Azure PowerShell
- ARM templates
- Bicep
- Terraform
- Azure SDKs

The Azure portal offers a browser-based workflow for creating a VM and its associated resources.[7]

For production, use Infrastructure as Code so network, disk, identity, monitoring, and security settings are repeatable and reviewable.

## Common use cases

Azure VMs are useful when you need OS-level control or cannot easily use a more managed service:

- Lift-and-shift legacy applications.
- Custom Windows or Linux server software.
- Self-hosted databases or enterprise products.
- Development/test environments.
- Build agents and CI runners.
- Specialized networking/security appliances.
- Custom machine images and drivers.
- Workloads requiring GPU or unusual OS/runtime configuration.

## When not to use a VM

A VM may add unnecessary operational work when Azure has a managed alternative:

| Need                               | Prefer considering                                |
| ---------------------------------- | ------------------------------------------------- |
| Stateless HTTP API / web app       | Azure App Service, Azure Container Apps, AKS      |
| Scheduled/background task          | Azure Functions, Container Apps Jobs              |
| Relational database                | Azure SQL Database, Azure Database for PostgreSQL |
| Object/file storage                | Azure Blob Storage, Azure Files                   |
| Messaging                          | Azure Service Bus, Event Hubs                     |
| Kubernetes container orchestration | AKS                                               |

Choose VMs when you genuinely need control; choose PaaS/serverless services when you want Azure to manage more of the platform.

## Cost considerations

VM compute billing generally depends on the size and how long the VM runs. But total cost can include:

- VM compute
- OS licensing, especially Windows or commercial Linux images
- Managed disks and snapshots
- Public IP, network egress, and load-balancing services
- Backup, monitoring, and security tooling

Stopping a VM from within the guest OS does **not** necessarily deallocate the Azure compute resource. To stop compute billing, stop/deallocate it from Azure:

```bash
az vm deallocate \
  --resource-group rg-demo \
  --name vm-demo
```

Disks and other attached resources can still incur charges after deallocation.

## Interview answer

> Azure Virtual Machines are Azure’s IaaS offering: on-demand, scalable Windows or Linux servers where I choose the image, VM size, disks, network, and software stack. Azure manages the physical infrastructure and hypervisor, while I manage the guest OS, applications, patching, access, and configuration. A VM typically includes a VNet, NIC, private IP, optional public IP, NSG, OS disk, and optional managed data disks. For production availability, I avoid a single VM and use multiple instances behind a load balancer, preferably across Availability Zones or through Virtual Machine Scale Sets. I use Azure VMs when I need OS-level control or must run legacy/custom software; otherwise I consider managed PaaS, containers, or serverless services to reduce operational overhead.[1][3][4][6]

## Sources

[1] Overview of virtual machines in Azure https://learn.microsoft.com/en-us/azure/virtual-machines/overview
[2] Azure Virtual Machines https://azure.microsoft.com/en-us/products/virtual-machines
[3] Sizes for virtual machines in Azure https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview
[4] Best practices for high availability with Azure VMs and ... https://learn.microsoft.com/en-us/azure/virtual-machines/disks-high-availability
[5] Azure availability zones – High Availability at Scale https://azure.microsoft.com/en-us/explore/global-infrastructure/availability-zones
[6] Availability sets overview - Azure Virtual Machines https://docs.azure.cn/en-us/virtual-machines/availability-set-overview
[7] Create a Windows virtual machine in the Azure portal https://learn.microsoft.com/en-us/azure/virtual-machines/windows/quick-create-portal
[8] Learn Live @ Ignite - Create a Windows virtual machine in Azure https://learn.microsoft.com/en-us/shows/learn-live/learn-live--ignite-create-a-windows-virtual-machine-in-azure
[9] Introduction to Azure virtual machines - Training https://learn.microsoft.com/en-us/training/modules/intro-to-azure-virtual-machines/
[10] High Availability in Azure VM - Microsoft Q&A https://learn.microsoft.com/en-us/answers/questions/1444880/high-availability-in-azure-vm
[11] Azure VMs high-availability setup for data disk or storage https://stackoverflow.com/questions/18011609/azure-vms-high-availability-setup-for-data-disk-or-storage
[12] Virtual machines in Azure https://learn.microsoft.com/en-us/azure/virtual-machines/
[13] Managing network access for managed disks - Microsoft Q&A https://learn.microsoft.com/en-us/answers/questions/2028479/managing-network-access-for-managed-disks
[14] High Availability Options for SQL Server on Azure VMs https://us.sios.com/blog/high-availability-sql-server-on-azure/
[15] Introduction to Microsoft Azure Virtual Machines https://www.linkedin.com/pulse/introduction-microsoft-azure-virtual-machines-bran-livinston--innbc
