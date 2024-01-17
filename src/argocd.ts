import { Construct } from 'constructs'
import { Chart } from 'cdk8s'
import { Application } from '../imports/argoproj.io'

export class ArgoCDChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    new Application(this, 'the-lab', {
      metadata: {
        name: 'the-lab',
        namespace: 'argocd',
        annotations: { 'argocd.argoproj.io/sync-wave': '-1' },
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
        annotations: { 'argocd.argoproj.io/sync-wave': '-1' },
      },
      spec: {
        project: 'default',
        source: {
          repoUrl: 'https://metallb.github.io/metallb',
          chart: 'metallb',
          targetRevision: '~0.13.12',
          helm: {
            releaseName: 'metallb',
          },
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
  }
}
