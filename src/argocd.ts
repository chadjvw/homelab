import { Construct } from 'constructs'
import { App, Chart } from 'cdk8s'
import { Application } from '../imports/argoproj.io'

export class ArgoCDChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    new Application(this, 'argocd', {
      metadata: {
        name: 'argocd-helm',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://argoproj.github.io/argo-helm',
          chart: 'argo/argo-cd',
          targetRevision: '~5.53.3',
          helm: {
            valuesObject: {
              server: {
                service: {
                  type: 'LoadBalancer',
                },
              },
            },
          },
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'argocd',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })

    new Application(this, 'the-lab', {
      metadata: {
        name: 'the-lab',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://github.com/chadjvw/homelab.git',
          path: 'manifests',
          targetRevision: 'HEAD',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'homelab',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })

    new Application(this, 'metallb', {
      metadata: {
        name: 'metallb',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://metallb.github.io/metallb',
          chart: 'metallb',
          targetRevision: '~0.13.12',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'metallb-system',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })

    new Application(this, 'external-dns', {
      metadata: {
        name: 'external-dns',
        namespace: 'argocd',
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://kubernetes-sigs.github.io/external-dns/',
          chart: 'external-dns',
          targetRevision: '~1.14.0',
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: 'external-dns',
        },
        syncPolicy: {
          automated: {},
          syncOptions: ['CreateNamespace=true'],
        },
      },
    })
  }
}
