## Signing and content trust

Signing means attaching a **digital signature** to a container image so consumers can verify it really came from the expected publisher and hasn’t been tampered with. Docker Content Trust (DCT) is Docker’s older implementation of this idea, using signed metadata to verify images from trusted registries. [docs.docker](https://docs.docker.com/engine/security/trust/)

## How it works

In content trust, a publisher signs image tags with private keys, and the client verifies them with the matching public keys before pulling or building. Docker’s trust model uses several key types such as root, targets, snapshot, timestamp, and optional delegation keys to control who can sign what. [docs.docker](https://docs.docker.com/engine/security/trust/trust_automation/)

## Why it matters

Signing helps protect against:

- tampered images,
- malicious re-tagging,
- and “pulling the wrong image by accident.” [docs.docker](https://docs.docker.com/engine/security/trust/trust_key_mng/)

It gives you stronger supply-chain confidence because you can prove the image came from the expected source. [cloudbees](https://www.cloudbees.com/blog/exploring-dockers-new-content-trust-feature)

## Important note

Docker Content Trust and the old Notary v1 service are being retired, so modern workflows often use newer signing approaches like **cosign/Sigstore** instead of relying on DCT for new systems. [docker](https://www.docker.com/blog/docker-content-trust-retirement-and-migration-guidance/)
