---
title: 'つくって、壊して、直して学ぶ Kubernetes入門'
description: 'つくって、壊して、直して学ぶ Kubernetes入門を読んだ覚え書き'
date: 2025-06-21
draft: false
---

{{< card
    url="https://www.shoeisha.co.jp/book/detail/9784798183961"
    image="https://www.shoeisha.co.jp/static/book/og_image/9784798183961.jpg"
    title="つくって、壊して、直して学ぶ Kubernetes入門 | 翔泳社"
    desc="動かなくっても、もう怖くない！トラブルシューティングを体験しながら学ぶ、実践的入門書。本書は、Kubernetesの実践的な知識をハンズオン形式で解説する書籍です｡"
>}}

[つくって、壊して、直して学ぶ Kubernetes入門](https://www.shoeisha.co.jp/book/detail/9784798183961)を読んだ覚え書き。

## モチベーション
- ハンズオン形式でkubernetesを触りたい
- 壊して直して学ぶというコンセプトが面白そう

## 全体像

Podが最小の単位｡Podには1つ以上のContainerが動いている｡  
メインとなるContainerの他の補助的なContainerをSidecarと呼ぶ
```mermaid
architecture-beta
    group pod(cloud)[Pod]

    service main_container(server)[Main Contaienr] in pod
    service sidecar(server)[Sidecar] in pod

    main_container:R --> L:sidecar
```

IngressからContainerにアクセスするまでにたどるコンポーネント｡
```mermaid
architecture-beta
    service ingress(internet)[Ingress]
    service services(internet)[Service]

	group dep(cloud)[Deployment]
	group rep(cloud)[ReplicaSet] in dep
    group pod(cloud)[Pod] in rep

	service container(server)[Container] in pod

    ingress:R --> L:services
    services:R --> L:container
```

## Pod, Containerのデバッグをする

ProductionのContainerイメージはshellが入っていないケースがままある｡  
この場合 `kubectl debug` コマンドでdebug用のContainerを作成することで操作が可能になる｡

```sh
kubectl debug -it <debug対象のPod名> --image=<debug用Containerイメージ> --target=<debug対象のContainer名> -- sh
```

shellが入っている場合は `kubectl exec`でアクセスできる｡

```sh
kubectl exec -it <Pod名> -- /bin/sh
```

## Service

ServiceのNodePortを使ったときの port, targetPort, nodePort の関係性｡
```mermaid
sequenceDiagram
    participant User
    participant NodePort
    participant Service
    participant Pod

    User->>NodePort: アクセス (NodeIP:30599)
    NodePort->>Service: 受信 (port:8082)
    Service->>Pod: 転送 (targetPort:8082)
    Pod-->>Service: レスポンス
    Service-->>NodePort: レスポンス
    NodePort-->>User: レスポンス
```


## ConfigMap

ConfigMapから取得した環境変数はアプリケーションを再起動しないと反映できない｡

```sh
kubectl rollout restart deployment/hello-server
```


## Probe

Readiness Probe
- Podのすべてのライフライクルでチェックされる
- Serviceリソースの接続対象とするかを判定
- http status codeが200~400であればOKとみなす

Liveness Probe
- Podを再起動する
- Readiness Probeと同時に使用できる
	- initialDelaySeconds は Readiness > Liveness となるようにする

Startup Probe
- コンテナ起動時にのみチェックされる
- Startup Probeが成功するまで､Readiness, Livenessのチェックは実行されない

## QoS Classes (Quolity of Service)

- resource.requests ... Containerが必要とするリソース量(CPU, Memなど)
- resource.limits ... Containerが使用できるリソース上限

resourceの設定状況によってOOMKillされる優先度が変化する｡3種類のQoS Classによって順番が決まる｡
1. Guaranteed: Pod内の全てのContainerにrequests, limitsの両方が指定している
2. Bustable: Pod内のいずれかのContainerにrequestsまたはlimitsが指定されている
3. BestEffort: 上記以外

## よく見かけたコマンド

```shell
kubectl apply -f <manifest.yaml>
kubectl delete -f <manifest.yaml>
kubectl get <resource type> <resource name>
kubectl describe <resource type> <resource name>
kubectl logs <pod名>
kubectl edit <resource type> <resource name>
```

## Kustomize

manifest.yamlに限らずyamlファイル全般で､共通部分と環境ごとの差分を管理できる｡  
便利そう｡

```
❯ tree
.
├── base
│   ├── deployment.yaml
│   └── kustomization.yaml
└── overlays
    ├── production
    │   ├── deployment.yaml
    │   ├── kustomization.yaml
    │   └── pdb.yaml
    └── staging
        └── kustomization.yaml
```

```cardlink
url: https://github.com/kubernetes-sigs/kustomize
title: "GitHub - kubernetes-sigs/kustomize: Customization of kubernetes YAML configurations"
description: "Customization of kubernetes YAML configurations. Contribute to kubernetes-sigs/kustomize development by creating an account on GitHub."
host: github.com
favicon: https://github.githubassets.com/favicons/favicon.svg
image: https://opengraph.githubassets.com/aaf180fc3d39f42c5d00c9d19dcae2f0ae4bed39ab3d5ec2dbc1c40e4b434ad0/kubernetes-sigs/kustomize
```

{{< card
    url="https://github.com/kubernetes-sigs/kustomize"
    image="https://opengraph.githubassets.com/aaf180fc3d39f42c5d00c9d19dcae2f0ae4bed39ab3d5ec2dbc1c40e4b434ad0/kubernetes-sigs/kustomize"
    title="GitHub - kubernetes-sigs/kustomize: Customization of kubernetes YAML configurations"
    desc="Customization of kubernetes YAML configurations. Contribute to kubernetes-sigs/kustomize development by creating an account on GitHub."
>}}

## 感想
壊して学ぶという言葉通りに､異常が起きたときにどういった観点で調査するか学べるのがとてもよかった｡手を動かしつつも写経にはならず､調べる順序や理由､観点が説明されていて覚えやすかった｡Chapter8では､これまでの内容を振り返る形の実践形式の内容があり､ちょうどよい難易度で楽しめた｡
