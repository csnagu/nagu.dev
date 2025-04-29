---
title: 'イラストでわかるDockerとKubernetes'
description: 'イラストでわかるDockerとKubernetesを読んだメモ'
date: 2025-04-29
draft: false
---

![イラストでわかるDockerとKubernetes](http://image.gihyo.co.jp/assets/images/cover/2020/9784297118372.jpg)

[イラストでわかるDockerとKubernetes](https://gihyo.jp/book/2020/978-4-297-11837-2)を読んだ覚え書き｡  
数年前に買って積んでいたら､いつのまにやら第2版が出ていた...｡


## モチベーション
- Dockerをときたま使っているのでDockerの理解を深めたい
- Kubernetesを使ったことがあるが､あまり理解していないので理解を深めたい

## 感想
### Dockerの話

Container界隈の標語は｢Build, Ship, Run｣｡
Container内のFSはCopy on Write(CoW)方式｡Binary Hacksで読んだやつ｡

レイヤごとにtarファイルがあるらしい｡これは初めて知った｡
その他Docker周りだと目新しい情報はなかった｡

### Kubernetesの話

- Deployment
	- Pod ... IPアドレス割当の最小単位
		- Container

Serviceで複数のPodへ簡単にアクセスができるようになる｡これはPodが再作成されることを前提とした作りになっており､PodのIPアドレスがコロコロ変わってもアクセス先を一意に定めるために存在する｡

### Container Runtimeの話

containerd, OpenShift, podmanなど聞いたことがある単語が出てきたが､具体的に使い分けるシーンがわからない｡｡いま必要としている知識でもないから､いつかわかる日が来たときの楽しみにしておく｡
