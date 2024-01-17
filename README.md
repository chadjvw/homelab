# The Lab - Kubernetes IaC version

## Setup So Far

1. Install [k3s](https://k3s.io/)
2. Setup [ArgoCD](https://argoproj.github.io/cd/)
3. Add this repo as an application pointing to the `manifests` directory
   - Argo is configured to use the generated manifests directory instead of a cdk8s plugin because the cdk8s plugin doesn't output valid k8s yaml with its `--stdout` flag during synth. To fix this, a `husky` pre-commit hook re-synths and adds the generated manifests on each commit.
