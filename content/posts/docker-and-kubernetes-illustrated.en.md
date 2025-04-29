---
title: 'Docker and Kubernetes Illustrated'
description: 'Reading notes on Docker and Kubernetes Illustrated'
date: 2025-04-29
draft: false
---

![Docker and Kubernetes Illustrated](http://image.gihyo.co.jp/assets/images/cover/2020/9784297118372.jpg)

This post is reading notes on [Docker and Kubernetes Illustrated](https://gihyo.jp/book/2020/978-4-297-11837-2).
I bought it a few years ago and it was sitting on my shelf, and before I knew it, the second edition was out....

## Motivation
- I occasionally use Docker and would like to deepen my understanding of it.
- Although I’ve used Kubernetes before, I don’t fully understand how it works, so I would like to dive deeper into itl

## Notes
### Docker

The well-known slogan in the container ecosystem is **Build, Ship, Run**.
In containers, the filesystem is based on the Copy-on-Write (CoW) mecanism, which I first encountered in *Binary Hacks*.
Each layer is stored as a tar archive, which was new to me.
Aside from that, most of the Docker-related information was already familiar.

### Kubernetes

- Deployment
  - Pod ... The smallest unit to which an IP address is assigned.
	- Container

In Kubernetes, a Service enables easy access to multiple Pods.  
It abstracts the dynamic nature of Pods, which may be recreated frequently, by providing a stable access point regardless of changing IP addresses.

This design assumes the impermanence of individual Pods and ensures seamless connectivity within the cluster.

### Container Runtimes

Names such as containerd, OpenShift and podman came up during the session. Although I’ve heard of them before, I’m not yet familiar with the differences how and when to use each.  
Since it’s not immediately relevant to my current work, I’ll keep it in mind as something to explore further in the future.
