# The Lab - Kubernetes IaC version

## Setup So Far

1. Install [k3s](https://k3s.io/)
2. Setup [ArgoCD](https://argoproj.github.io/cd/)
3. Add [`cdk8s`](https://cdk8s.io/) sidecar
   - `kubectl patch deployment argocd-repo-server -n argocd --patch-file argo.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
name: argocd-repo-server
namespace: argocd
spec:
template:
      spec:
      containers:
         - name: cdk8s-plugin
            image: ghcr.io/wyvernzora/argocd-cdk8s-plugin
            command:
            - /var/run/argocd/argocd-cmp-server
            volumeMounts:
            - name: var-files
               mountPath: /var/run/argocd
            - name: plugins
               mountPath: /home/argocd/cmp-server/plugins
            - name: cdk8s-working-dir
               mountPath: /tmp
            securityContext:
               runAsNonRoot: true
               runAsUser: 999
      volumes:
         - name: cdk8s-working-dir
            emptyDir: { }
```

1. Add this repo as an application
