import { Construct } from 'constructs'
import { Chart, Helm } from 'cdk8s'

export class MetalLbChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    // const namespace = new Namespace(this, 'namespace', {
    //   metadata: {
    //     labels: {
    //       'pod-security.kubernetes.io/audit': 'privileged',
    //       'pod-security.kubernetes.io/enforce': 'privileged',
    //       'pod-security.kubernetes.io/warn': 'privileged',
    //     },
    //     name: 'metallb-system',
    //   },
    // })

    new Helm(this, 'metallb', {
      chart: 'metallb',
      repo: 'https://metallb.github.io/metallb',
      namespace: 'metallb-system',
    })

    // metallb.node.addDependency(namespace)
  }
}
