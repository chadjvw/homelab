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
  }
}
